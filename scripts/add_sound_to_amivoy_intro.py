from array import array
import ctypes
import ctypes.util
import math
from pathlib import Path
import shutil
import subprocess
import wave


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "video-intro-amivoy"
VIDEO = OUT / "Amivoy-introduction-reseaux-sociaux-sans-son.mp4"
FINAL = OUT / "Amivoy-introduction-reseaux-sociaux.mp4"
FINAL_CLEAR_NAME = OUT / "Amivoy-introduction-reseaux-sociaux-avec-son.mp4"
RATE = 22050
DURATION = 20
TOTAL = RATE * DURATION
MAX = 32767


def synthesize(text):
    library_path = ctypes.util.find_library("espeak-ng")
    if not library_path:
        raise RuntimeError("La bibliothèque vocale eSpeak NG est introuvable.")
    lib = ctypes.CDLL(library_path)
    callback_type = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
    chunks = []

    def receive(wav, sample_count, events):
        if wav and sample_count:
            chunks.append(ctypes.string_at(wav, sample_count * ctypes.sizeof(ctypes.c_short)))
        return 0

    callback = callback_type(receive)
    lib.espeak_Initialize.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
    lib.espeak_Initialize.restype = ctypes.c_int
    sample_rate = lib.espeak_Initialize(2, 100, None, 0)  # Synchronous audio retrieval.
    if sample_rate <= 0:
        raise RuntimeError("Impossible d’initialiser la voix française.")
    lib.espeak_SetSynthCallback.argtypes = [callback_type]
    lib.espeak_SetSynthCallback(callback)
    lib.espeak_SetVoiceByName.argtypes = [ctypes.c_char_p]
    lib.espeak_SetVoiceByName.restype = ctypes.c_int
    if lib.espeak_SetVoiceByName(b"fr") != 0:
        raise RuntimeError("La voix française eSpeak NG n’est pas disponible.")
    lib.espeak_SetParameter.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int]
    lib.espeak_SetParameter(1, 168, 0)  # Clear, measured narration pace.
    lib.espeak_SetParameter(2, 100, 0)
    lib.espeak_SetParameter(3, 48, 0)
    lib.espeak_SetParameter(4, 45, 0)
    lib.espeak_Synth.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint, ctypes.c_int,
                                 ctypes.c_uint, ctypes.c_uint, ctypes.POINTER(ctypes.c_uint), ctypes.c_void_p]
    lib.espeak_Synth.restype = ctypes.c_int
    lib.espeak_Synchronize.restype = ctypes.c_int

    encoded = text.encode("utf-8") + b"\0"
    status = lib.espeak_Synth(encoded, len(encoded), 0, 1, 0, 1, None, None)
    if status != 0 or lib.espeak_Synchronize() != 0:
        raise RuntimeError("La synthèse de la narration a échoué.")
    lib.espeak_Terminate()
    return b"".join(chunks), sample_rate


def write_wav(path, samples, channels=1):
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(samples.tobytes())


def make_music():
    # Original light, upbeat instrumental: warm chord pads, a soft bass pulse,
    # and a small bell motif. No third-party recording or sample is used.
    chords = [(130.81,164.81,196.00), (110.00,130.81,164.81),
              (87.31,110.00,130.81), (98.00,123.47,146.83)]
    roots = [65.41,55.00,43.65,49.00]
    melody = [523.25,659.25,783.99,659.25,587.33,783.99,880.00,783.99,
              523.25,659.25,698.46,783.99,587.33,659.25,523.25,392.00]
    out = array("h")
    beat = 60/96
    for n in range(TOTAL):
        t = n/RATE
        bar = int(t/2.5) % 4
        phase = t % 2.5
        chord_env = 0.72 + 0.28*math.sin(math.pi*phase/2.5)
        pad = sum(math.sin(2*math.pi*f*t) for f in chords[bar]) * 0.026 * chord_env
        beat_pos = t % beat
        note_idx = int((t % 5.0)/(5.0/16)) % len(melody)
        note_env = math.exp(-beat_pos*5.3)
        pluck = math.sin(2*math.pi*melody[note_idx]*t) * 0.105 * note_env
        overtone = math.sin(2*math.pi*melody[note_idx]*2*t) * 0.018 * note_env
        bass_env = math.exp(-beat_pos*4.2)
        bass = math.sin(2*math.pi*roots[bar]*t) * 0.075 * bass_env
        # Soft low thump on each bar beat, kept behind the spoken words.
        kick = math.sin(2*math.pi*(72-24*min(beat_pos/0.12,1))*t) * 0.055 * math.exp(-beat_pos*27)
        music = (pad+pluck+overtone+bass+kick) * min(1,t/0.45) * min(1,(DURATION-t)/1.1)
        out.append(max(-MAX,min(MAX,round(music*MAX))))
    return out


def main():
    if not VIDEO.exists():
        raise FileNotFoundError(VIDEO)
    phrases = [
        (0.34, "Amivoy. Les bons plans commencent ensemble."),
        (4.13, "Une idée de sortie ? Organisez le lieu, la date et retrouvez votre groupe."),
        (8.12, "Un voyage en tête ? Imaginez les étapes, le programme et la checklist."),
        (12.10, "Et après ? Gardez les souvenirs de vos moments partagés."),
        (15.92, "Amivoy. Sorties, voyages, souvenirs. Suivez l’aventure. Le projet est en développement."),
    ]
    speech = array("h", [0]) * TOTAL
    active_ranges = []
    for start, phrase in phrases:
        raw, rate = synthesize(phrase)
        if rate != RATE:
            raise RuntimeError(f"Taux d’échantillonnage vocal inattendu : {rate} Hz")
        clip = array("h"); clip.frombytes(raw)
        peak = max((abs(sample) for sample in clip), default=1)
        gain = min(2.2, 27800/max(peak,1))
        offset = int(start*RATE)
        for i,sample in enumerate(clip):
            target=offset+i
            if target>=TOTAL: break
            speech[target]=max(-MAX,min(MAX,round(speech[target]+sample*gain)))
        active_ranges.append((offset,min(TOTAL,offset+len(clip))))

    music = make_music()
    mixed = array("h", [0]) * TOTAL
    speech_active = [False] * TOTAL
    for start,end in active_ranges:
        speech_active[start:end] = [True]*(end-start)
    for i in range(TOTAL):
        # Duck the soundtrack while the narration speaks; lift it between phrases.
        music_gain = 0.18 if speech_active[i] else 0.58
        mixed[i] = max(-MAX,min(MAX,round(speech[i] + music[i]*music_gain)))

    speech_path=OUT/"Narration-française.wav"
    music_path=OUT/"Musique-originale.wav"
    mix_path=OUT/"Mix-narration-musique.wav"
    write_wav(speech_path,speech)
    write_wav(music_path,music)
    write_wav(mix_path,mixed)

    pipeline=["gst-launch-1.0","-e","-q",
      "filesrc",f"location={VIDEO}","!","qtdemux","name=demux",
      "demux.video_0","!","queue","!","mux.video_0",
      "filesrc",f"location={mix_path}","!","wavparse","!","audioconvert","!","audioresample","!",
      "avenc_aac","bitrate=160000","!","aacparse","!","queue","!","mux.audio_0",
      "mp4mux","name=mux","faststart=true","!","filesink",f"location={FINAL}"]
    result=subprocess.run(pipeline,capture_output=True,text=True)
    if result.returncode:
        raise RuntimeError((result.stderr or result.stdout)[-5000:])
    shutil.copy2(FINAL, FINAL_CLEAR_NAME)

    (OUT/"Texte-video-et-voix-off.txt").write_text(
      "INTRO AMIVOY · 20 SECONDES · FORMAT VERTICAL 9:16\n\n"
      "Narration intégrée au MP4 :\n"
      "Amivoy. Les bons plans commencent ensemble. Une idée de sortie ? Organisez le lieu, la date et retrouvez votre groupe. "
      "Un voyage en tête ? Imaginez les étapes, le programme et la checklist. Et après ? Gardez les souvenirs de vos moments partagés. "
      "Amivoy. Sorties, voyages, souvenirs. Suivez l’aventure. Le projet est en développement.\n\n"
      "La musique de fond est une composition originale synthétisée pour cette vidéo. La narration et la musique sont aussi fournies séparément dans le kit.\n",
      encoding="utf-8")
    print(f"Vidéo sonorisée : {FINAL}")


if __name__=="__main__":
    main()
