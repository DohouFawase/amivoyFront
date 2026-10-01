import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { tripsService } from "@/services/tripsService";
import type { ContributionRecord, TripMemberRecord, ExpenseRecord, ExpenseParticipantRecord, ExchangeRateRecord } from "@/interface/trips";
import {
  createBudget,
  createBudgetLine,
  fetchBudgetLines,
  fetchBudgets,
  fetchExchangeRates,
  fetchTrip,
} from "@/actions/tripActions";
import { AppText, AppTextInput } from "@/components/app-text";
import { C, Header, Page, SectionTitle, Surface } from "@/components/app-ui";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export default function Budget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { trips, budgets, budgetLines, exchangeRates, error, notice, requestStatus } = useAppSelector((state) => state.trips);
  const [category, setCategory] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [members, setMembers] = useState<TripMemberRecord[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [contributionAmount, setContributionAmount] = useState("");
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipantRecord[]>([]);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [activeExpense, setActiveExpense] = useState<ExpenseRecord | null>(null);
  const [participantMember, setParticipantMember] = useState("");
  const [participantAmount, setParticipantAmount] = useState("");
  const [editingParticipant, setEditingParticipant] = useState<ExpenseParticipantRecord | null>(null);
  const [participantDraft, setParticipantDraft] = useState("");
  const [editingRate, setEditingRate] = useState<ExchangeRateRecord | null>(null);
  const [editingContribution, setEditingContribution] = useState<ContributionRecord | null>(null);
  const [contributionDraft, setContributionDraft] = useState("");
  const [rateBase, setRateBase] = useState("");
  const [rateQuote, setRateQuote] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [rateSource, setRateSource] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineCategoryDraft, setLineCategoryDraft] = useState("");
  const [lineAmountDraft, setLineAmountDraft] = useState("");
  const user = useAppSelector((state) => state.auth.user);
  const currentMember = members.find((item) => item.user_id === user?.id && item.status === "active");
  const trip = trips.find((item) => item.id === id);
  const budget = budgets.find((item) => item.trip_id === id);
  const lines = useMemo(
    () => budgetLines.filter((line) => line.budget_id === budget?.id),
    [budgetLines, budget?.id],
  );
  const currency = budget?.currency ?? trip?.currency ?? "XOF";
  const plannedTotal = budget?.total_planned ?? trip?.planned_budget ?? 0;
  const plannedLinesTotal = lines.reduce((total, line) => total + line.planned_amount, 0);

  useEffect(() => {
    void dispatch(fetchTrip(id));
    void dispatch(fetchBudgets());
    void dispatch(fetchBudgetLines());
    void dispatch(fetchExchangeRates());
    Promise.all([tripsService.fetchTripMembers(id), tripsService.fetchContributions(id), tripsService.fetchExpenses(id)])
      .then(([tripMembers, tripContributions, tripExpenses]) => { setMembers(tripMembers); setContributions(tripContributions); setExpenses(tripExpenses); })
      .catch(() => setBudgetError("Les participations au budget n’ont pas pu être chargées."));
  }, [dispatch, id]);

  async function initializeBudget() {
    setBudgetError("");
    try {
      await dispatch(createBudget({ trip_id: id, total_planned: plannedTotal, currency })).unwrap();
      await dispatch(fetchBudgets());
    } catch {
      return;
    }
  }

  async function openBudgetEdit() {
    if (!budget) return;
    try { const detail = await tripsService.fetchBudget(budget.id); setBudgetDraft(String(detail.total_planned)); setEditingBudget(true); setBudgetError(""); }
    catch { setBudgetError("Le détail du budget n’a pas pu être chargé."); }
  }

  async function saveBudget() {
    if (!budget) return;
    const amount = Number(budgetDraft.replace(/\s/g, ""));
    if (!Number.isInteger(amount) || amount < 0) { setBudgetError("Saisis un budget total entier positif."); return; }
    try { await tripsService.updateBudget(budget.id, { total_planned: amount }); await dispatch(fetchBudgets()).unwrap(); setEditingBudget(false); setBudgetError(""); }
    catch { setBudgetError("Le budget total n’a pas pu être modifié."); }
  }

  function confirmDeleteBudget() {
    if (!budget) return;
    Alert.alert("Supprimer le budget ?", "Le budget prévisionnel sera supprimé du voyage.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { void (async () => {
        try { await tripsService.deleteBudget(budget.id); await dispatch(fetchBudgets()).unwrap(); await dispatch(fetchBudgetLines()).unwrap(); setEditingBudget(false); }
        catch { setBudgetError("Le budget n’a pas pu être supprimé."); }
      })(); } },
    ]);
  }

  async function openLineEdit(id: string) {
    try { const detail = await tripsService.fetchBudgetLine(id); setEditingLineId(detail.id); setLineCategoryDraft(detail.category); setLineAmountDraft(String(detail.planned_amount)); setBudgetError(""); }
    catch { setBudgetError("Le détail de cette ligne n’a pas pu être chargé."); }
  }

  async function saveLine(id: string) {
    const amount = Number(lineAmountDraft.replace(/\s/g, ""));
    if (!lineCategoryDraft.trim() || !Number.isInteger(amount) || amount < 0) { setBudgetError("Saisis une catégorie et un montant entier positif."); return; }
    try { await tripsService.updateBudgetLine(id, { category: lineCategoryDraft.trim(), planned_amount: amount }); await dispatch(fetchBudgetLines()).unwrap(); setEditingLineId(null); setBudgetError(""); }
    catch { setBudgetError("Cette ligne de budget n’a pas pu être modifiée."); }
  }

  function confirmDeleteLine(lineId: string) {
    Alert.alert("Supprimer cette ligne ?", "Elle sera retirée du budget du voyage.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { void (async () => {
        try { await tripsService.deleteBudgetLine(lineId); await dispatch(fetchBudgetLines()).unwrap(); if (editingLineId === lineId) setEditingLineId(null); }
        catch { setBudgetError("Cette ligne n’a pas pu être supprimée."); }
      })(); } },
    ]);
  }

  async function addContribution() {
    const amount = Number(contributionAmount.replace(/\s/g, ""));
    if (!currentMember) { setBudgetError("Ton compte doit être membre actif pour proposer une participation."); return; }
    if (!Number.isInteger(amount) || amount <= 0) { setBudgetError("Saisis un montant de participation valide."); return; }
    try { const saved = await tripsService.createContribution({ trip_id: id, member_id: currentMember.id, expected_amount: amount, paid_amount: 0, status: "expected" }); setContributions((current) => [saved, ...current]); setContributionAmount(""); setBudgetError(""); }
    catch { setBudgetError("La participation n’a pas pu être enregistrée."); }
  }

  async function openExpense(item: ExpenseRecord) { try { const detail = await tripsService.fetchExpense(item.id); const shares = await tripsService.fetchExpenseParticipants(item.id); setActiveExpense(detail); setExpenseParticipants(shares); } catch { setBudgetError("Le détail de la dépense n’a pas pu être chargé."); } }
  async function saveExpense() {
    const amount = Number(expenseAmount.replace(/\s/g, ""));
    if (!expenseTitle.trim() || !Number.isInteger(amount) || amount <= 0) { setBudgetError("Saisis un libellé et un montant valide."); return; }
    try {
      if (editingExpense) { const saved = await tripsService.updateExpense(editingExpense.id, { title: expenseTitle.trim(), amount }); setExpenses((xs) => xs.map((x) => x.id === saved.id ? saved : x)); setEditingExpense(null); }
      else { if (!currentMember) throw new Error("member"); const saved = await tripsService.createExpense({ trip_id: id, paid_by: currentMember.id, title: expenseTitle.trim(), amount, currency, split_mode: "equal", spent_at: new Date().toISOString() }); setExpenses((xs) => [saved, ...xs]); }
      setExpenseTitle(""); setExpenseAmount(""); setBudgetError("");
    } catch { setBudgetError("La dépense n’a pas pu être enregistrée."); }
  }
  async function addExpenseParticipant() {
    if (!activeExpense || !participantMember) return;
    const amount = Number(participantAmount.replace(/\s/g, ""));
    if (!Number.isInteger(amount) || amount < 0) { setBudgetError("Saisis une part entière valide."); return; }
    try { const saved = await tripsService.createExpenseParticipant({ expense_id: activeExpense.id, member_id: participantMember, share_amount: amount }); setExpenseParticipants((xs) => [saved, ...xs]); setParticipantMember(""); setParticipantAmount(""); }
    catch { setBudgetError("La part du membre n’a pas pu être ajoutée."); }
  }
  async function editParticipant(item: ExpenseParticipantRecord) { try { const detail = await tripsService.fetchExpenseParticipant(item.id); setEditingParticipant(detail); setParticipantDraft(String(detail.share_amount)); } catch { setBudgetError("Le détail de cette part n’a pas pu être chargé."); } }
  async function saveParticipant() { if (!editingParticipant) return; const amount = Number(participantDraft.replace(/\s/g, "")); if (!Number.isInteger(amount) || amount < 0) { setBudgetError("Saisis un montant entier valide."); return; } try { const saved = await tripsService.updateExpenseParticipant(editingParticipant.id, { share_amount: amount }); setExpenseParticipants((xs) => xs.map((x) => x.id === saved.id ? saved : x)); setEditingParticipant(null); } catch { setBudgetError("La part n’a pas pu être modifiée."); } }
  function removeExpenseParticipant(item: ExpenseParticipantRecord) { Alert.alert("Retirer cette part ?", "La répartition de la dépense sera mise à jour.", [{ text: "Annuler", style: "cancel" }, { text: "Retirer", style: "destructive", onPress: () => { void tripsService.deleteExpenseParticipant(item.id).then(() => setExpenseParticipants((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setBudgetError("La part n’a pas pu être supprimée.")); } }]); }
  function removeExpense(item: ExpenseRecord) { Alert.alert("Supprimer cette dépense ?", item.title, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteExpense(item.id).then(() => { setExpenses((xs) => xs.filter((x) => x.id !== item.id)); if (activeExpense?.id === item.id) setActiveExpense(null); }).catch(() => setBudgetError("La dépense n’a pas pu être supprimée.")); } }]); }
  async function editContribution(item: ContributionRecord) {
    try { const detail = await tripsService.fetchContribution(item.id); setEditingContribution(detail); setContributionDraft(String(detail.expected_amount)); setBudgetError(""); }
    catch { setBudgetError("Le détail de la participation n’a pas pu être chargé."); }
  }
  async function saveContribution() {
    if (!editingContribution) return;
    const amount = Number(contributionDraft.replace(/\s/g, ""));
    if (!Number.isInteger(amount) || amount < 0) { setBudgetError("Saisis un montant entier positif."); return; }
    try { const updated = await tripsService.updateContribution(editingContribution.id, { expected_amount: amount }); setContributions((xs) => xs.map((x) => x.id === updated.id ? updated : x)); setEditingContribution(null); setBudgetError(""); }
    catch { setBudgetError("La participation n’a pas pu être modifiée."); }
  }
  function removeContribution(item: ContributionRecord) { Alert.alert("Supprimer cette participation ?", "La prévision sera retirée du budget.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteContribution(item.id).then(() => setContributions((xs) => xs.filter((x) => x.id !== item.id))).catch(() => setBudgetError("La participation n’a pas pu être supprimée.")); } }]); }
  async function manageRate(rate: ExchangeRateRecord) { try { const detail = await tripsService.fetchExchangeRate(rate.id); setEditingRate(detail); setRateBase(detail.base); setRateQuote(detail.quote); setRateValue(String(detail.rate)); setRateSource(detail.source ?? ""); } catch { setBudgetError("Le détail du taux n’a pas pu être chargé."); } }
  async function saveRate() {
    if (!editingRate) return; const rate = Number(rateValue.replace(",", "."));
    if (!rateBase.trim() || !rateQuote.trim() || !Number.isFinite(rate) || rate <= 0) { setBudgetError("Saisis les devises et un taux positif."); return; }
    try { await tripsService.updateExchangeRate(editingRate.id, { base: rateBase.trim().toUpperCase(), quote: rateQuote.trim().toUpperCase(), rate, source: rateSource.trim() || null }); await dispatch(fetchExchangeRates()).unwrap(); setEditingRate(null); setBudgetError(""); }
    catch { setBudgetError("Le taux n’a pas pu être modifié."); }
  }
  function removeRate(rate: ExchangeRateRecord) { Alert.alert("Supprimer ce taux ?", `${rate.base} → ${rate.quote}`, [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { void tripsService.deleteExchangeRate(rate.id).then(() => dispatch(fetchExchangeRates())).catch(() => setBudgetError("Le taux n’a pas pu être supprimé.")); } }]); }
  async function addExchangeRate() {
    const rate = Number(rateValue.replace(",", "."));
    if (!rateBase.trim() || !rateQuote.trim() || !Number.isFinite(rate) || rate <= 0) { setBudgetError("Saisis les devises et un taux positif."); return; }
    try { await tripsService.createExchangeRate({ base: rateBase.trim().toUpperCase(), quote: rateQuote.trim().toUpperCase(), rate, source: rateSource.trim() || undefined, fetched_at: new Date().toISOString() }); await dispatch(fetchExchangeRates()).unwrap(); setRateBase(""); setRateQuote(""); setRateValue(""); setRateSource(""); setBudgetError(""); }
    catch { setBudgetError("Le taux n’a pas pu être créé. Cette action est réservée à l’administration."); }
  }

  async function addLine() {
    const amount = Number(plannedAmount.replace(/\s/g, ""));
    if (!budget) {
      setBudgetError("Initialise d’abord le budget du voyage.");
      return;
    }
    if (!category.trim() || !Number.isInteger(amount) || amount < 0) {
      setBudgetError("Saisis une catégorie et un montant entier positif.");
      return;
    }

    setBudgetError("");
    try {
      await dispatch(createBudgetLine({ budget_id: budget.id, category: category.trim(), planned_amount: amount })).unwrap();
      setCategory("");
      setPlannedAmount("");
    } catch {
      return;
    }
  }

  return (
    <Page>
      <Header back title="Budget du voyage" />
      <AppText style={styles.heading}>Les comptes sont clairs.</AppText>
      <AppText style={styles.sub}>{trip?.title ?? "Voyage"} · budget prévu et lignes enregistrés sur le serveur.</AppText>
      <Surface style={styles.hero}>
        <AppText style={styles.heroLabel}>BUDGET TOTAL</AppText>
        <AppText style={styles.total}>{plannedTotal.toLocaleString("fr-FR")} {currency}</AppText>
        <View style={styles.track}><View style={[styles.fill, { width: `${plannedTotal > 0 ? Math.min(100, (plannedLinesTotal / plannedTotal) * 100) : 0}%` }]} /></View>
        <View style={styles.summaryRow}>
          <AppText style={styles.heroSub}>Lignes prévues {plannedLinesTotal.toLocaleString("fr-FR")} {currency}</AppText>
          <AppText style={styles.heroSub}>Reste {Math.max(0, plannedTotal - plannedLinesTotal).toLocaleString("fr-FR")} {currency}</AppText>
        </View>
        {budget && <View style={styles.managementRow}><Pressable onPress={() => void openBudgetEdit()}><AppText style={styles.manageText}>Modifier le budget</AppText></Pressable><Pressable onPress={confirmDeleteBudget}><AppText style={styles.deleteText}>Supprimer</AppText></Pressable></View>}
      </Surface>
      {editingBudget && <Surface style={styles.form}><AppTextInput value={budgetDraft} onChangeText={setBudgetDraft} keyboardType="number-pad" placeholder="Budget total" style={styles.input} /><View style={styles.addRow}><Pressable onPress={() => void saveBudget()} style={styles.addButton}><AppText style={styles.addText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingBudget(false)} style={styles.cancelButton}><AppText style={styles.manageText}>Annuler</AppText></Pressable></View></Surface>}

      {!budget && (
        <Pressable onPress={() => void initializeBudget()} disabled={requestStatus === "loading"} style={styles.primaryButton}>
          <AppText style={styles.primaryText}>{requestStatus === "loading" ? "Création…" : "Initialiser le budget du voyage"}</AppText>
        </Pressable>
      )}
+
      <SectionTitle title="Lignes de budget" action={`${lines.length}`} />
      {budget && <Surface style={styles.form}>
        <AppTextInput value={category} onChangeText={setCategory} placeholder="Catégorie · hébergement, repas…" style={styles.input} />
        <View style={styles.addRow}>
          <AppTextInput value={plannedAmount} onChangeText={setPlannedAmount} keyboardType="number-pad" placeholder={`Montant en ${currency}`} style={[styles.input, { flex: 1 }]} />
          <Pressable onPress={() => void addLine()} disabled={requestStatus === "loading"} style={styles.addButton}><AppText style={styles.addText}>Ajouter</AppText></Pressable>
        </View>
      </Surface>}
      {lines.map((line) => <Surface key={line.id} style={styles.line}>
        <View style={styles.lineIcon}><AppText style={styles.lineIconText}>₣</AppText></View>
        {editingLineId === line.id ? <View style={{ flex: 1, gap: 6 }}><AppTextInput value={lineCategoryDraft} onChangeText={setLineCategoryDraft} placeholder="Catégorie" style={styles.input} /><AppTextInput value={lineAmountDraft} onChangeText={setLineAmountDraft} keyboardType="number-pad" placeholder="Montant" style={styles.input} /><View style={styles.manageActions}><Pressable onPress={() => void saveLine(line.id)}><AppText style={styles.manageText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingLineId(null)}><AppText style={styles.sub}>Annuler</AppText></Pressable></View></View> : <><View style={{ flex: 1 }}><AppText style={styles.lineCategory}>{line.category}</AppText><AppText style={styles.sub}>Prévision</AppText></View><View style={{ alignItems: "flex-end", gap: 6 }}><AppText style={styles.lineAmount}>{line.planned_amount.toLocaleString("fr-FR")} {currency}</AppText><View style={styles.manageActions}><Pressable onPress={() => void openLineEdit(line.id)}><AppText style={styles.manageText}>Modifier</AppText></Pressable><Pressable onPress={() => confirmDeleteLine(line.id)}><AppText style={styles.deleteText}>Supprimer</AppText></Pressable></View></View></>}
      </Surface>)}
      {budget && lines.length === 0 && <AppText style={styles.sub}>Ajoute une ligne pour répartir le budget prévu.</AppText>}
+
      <SectionTitle title="Dépenses réelles" action={`${expenses.length}`} />
      {currentMember && <Surface style={styles.form}><AppTextInput value={expenseTitle} onChangeText={setExpenseTitle} placeholder="Libellé de la dépense" style={styles.input} /><View style={styles.addRow}><AppTextInput value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="number-pad" placeholder={`Montant en ${currency}`} style={[styles.input, { flex: 1 }]} /><Pressable onPress={() => void saveExpense()} style={styles.addButton}><AppText style={styles.addText}>{editingExpense ? "Enregistrer" : "Ajouter"}</AppText></Pressable></View>{editingExpense && <Pressable onPress={() => setEditingExpense(null)}><AppText style={styles.manageText}>Annuler la modification</AppText></Pressable>}</Surface>}
      {expenses.map((item) => <Surface key={item.id} style={styles.rateRow}><View style={{ flex: 1 }}><AppText style={styles.lineCategory}>{item.title}</AppText><AppText style={styles.sub}>{item.spent_at ? new Date(item.spent_at).toLocaleDateString() : "Date non indiquée"}</AppText></View><AppText style={styles.lineAmount}>{item.amount.toLocaleString("fr-FR")} {item.currency}</AppText><Pressable onPress={() => void openExpense(item)}><AppText style={styles.manageText}>Détails</AppText></Pressable><Pressable onPress={() => { setEditingExpense(item); setExpenseTitle(item.title); setExpenseAmount(String(item.amount)); }}><AppText style={styles.manageText}>Modifier</AppText></Pressable><Pressable onPress={() => removeExpense(item)}><AppText style={styles.deleteText}>Supprimer</AppText></Pressable></Surface>)}
      {activeExpense && <Surface style={styles.form}><AppText style={styles.lineCategory}>Répartition · {activeExpense.title}</AppText>{expenseParticipants.map((share) => <View key={share.id} style={styles.manageActions}><AppText style={[styles.sub, { flex: 1 }]}>{members.find((m) => m.id === share.member_id)?.user?.first_name || "Membre"} · {share.share_amount} {currency}</AppText><Pressable onPress={() => void editParticipant(share)}><AppText style={styles.manageText}>Modifier</AppText></Pressable><Pressable onPress={() => removeExpenseParticipant(share)}><AppText style={styles.deleteText}>Retirer</AppText></Pressable></View>)}<View style={styles.addRow}><AppTextInput value={participantAmount} onChangeText={setParticipantAmount} keyboardType="number-pad" placeholder="Part" style={[styles.input, { flex: 1 }]} /><Pressable onPress={() => void addExpenseParticipant()} style={styles.addButton}><AppText style={styles.addText}>Ajouter part</AppText></Pressable></View><View style={styles.manageActions}>{members.map((m) => <Pressable key={m.id} onPress={() => setParticipantMember(m.id)} style={participantMember === m.id ? styles.addButton : styles.cancelButton}><AppText style={participantMember === m.id ? styles.addText : styles.manageText}>{m.user?.first_name || "Membre"}</AppText></Pressable>)}</View>{editingParticipant && <View style={styles.addRow}><AppTextInput value={participantDraft} onChangeText={setParticipantDraft} keyboardType="number-pad" placeholder="Montant de la part" style={[styles.input, { flex: 1 }]} /><Pressable onPress={() => void saveParticipant()}><AppText style={styles.manageText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingParticipant(null)}><AppText style={styles.sub}>Annuler</AppText></Pressable></View>}<Pressable onPress={() => setActiveExpense(null)}><AppText style={styles.sub}>Fermer</AppText></Pressable></Surface>}
      {!expenses.length && <AppText style={styles.sub}>Aucune dépense réelle enregistrée.</AppText>}

      <SectionTitle title="Participations au budget" action={`${contributions.length}`} />
      {currentMember && <Surface style={styles.form}><AppText style={styles.sub}>Propose ta contribution attendue. Aucun paiement n’est effectué ici.</AppText><View style={styles.addRow}><AppTextInput value={contributionAmount} onChangeText={setContributionAmount} keyboardType="number-pad" placeholder={`Montant en ${currency}`} style={[styles.input, { flex: 1 }]} /><Pressable onPress={() => void addContribution()} style={styles.addButton}><AppText style={styles.addText}>Proposer</AppText></Pressable></View></Surface>}
      {editingContribution && <Surface style={styles.form}><AppText style={styles.sub}>Modifier la prévision de participation</AppText><AppTextInput value={contributionDraft} onChangeText={setContributionDraft} keyboardType="number-pad" placeholder="Montant prévu" style={styles.input} /><View style={styles.manageActions}><Pressable onPress={() => void saveContribution()}><AppText style={styles.manageText}>Enregistrer</AppText></Pressable><Pressable onPress={() => setEditingContribution(null)}><AppText style={styles.sub}>Annuler</AppText></Pressable></View></Surface>}
      {contributions.map((contribution) => <Surface key={contribution.id} style={styles.rateRow}><View style={{ flex: 1 }}><AppText style={styles.lineCategory}>{contribution.member_id === currentMember?.id ? "Ma participation" : "Participation du membre"}</AppText><AppText style={styles.sub}>{contribution.status ?? "En attente"}</AppText></View><AppText style={styles.lineAmount}>{contribution.expected_amount.toLocaleString("fr-FR")} {currency}</AppText><Pressable onPress={() => void editContribution(contribution)}><AppText style={styles.manageText}>Modifier</AppText></Pressable><Pressable onPress={() => removeContribution(contribution)}><AppText style={styles.deleteText}>Supprimer</AppText></Pressable></Surface>)}
      {!contributions.length && <AppText style={styles.sub}>Aucune participation proposée pour ce voyage.</AppText>}

      <SectionTitle title="Taux de change disponibles" />
      {exchangeRates.map((rate) => <Surface key={rate.id} style={styles.rateRow}>
        <AppText style={styles.lineCategory}>{rate.base} → {rate.quote}</AppText>
        <AppText style={styles.lineAmount}>{Number(rate.rate).toLocaleString("fr-FR")}</AppText>
        <AppText style={styles.sub}>{rate.source ?? "Source non précisée"}</AppText>
        {user?.platform_role === "admin" && <><Pressable onPress={() => void manageRate(rate)}><AppText style={styles.manageText}>Modifier</AppText></Pressable><Pressable onPress={() => removeRate(rate)}><AppText style={styles.deleteText}>Supprimer</AppText></Pressable></>}
      </Surface>)}
      {exchangeRates.length === 0 && requestStatus !== "loading" && <AppText style={styles.sub}>Aucun taux de change renvoyé par le serveur.</AppText>}
      {user?.platform_role === "admin" && <Surface style={styles.form}><AppText style={styles.sub}>Ajouter un taux · réservé à l’administration</AppText><View style={styles.addRow}><AppTextInput value={rateBase} onChangeText={setRateBase} autoCapitalize="characters" placeholder="De (ex. EUR)" style={[styles.input, { flex: 1 }]} /><AppTextInput value={rateQuote} onChangeText={setRateQuote} autoCapitalize="characters" placeholder="Vers (ex. XOF)" style={[styles.input, { flex: 1 }]} /></View><AppTextInput value={rateValue} onChangeText={setRateValue} keyboardType="decimal-pad" placeholder="Taux" style={styles.input} /><AppTextInput value={rateSource} onChangeText={setRateSource} placeholder="Source (facultatif)" style={styles.input} /><Pressable onPress={() => editingRate ? void saveRate() : void addExchangeRate()} style={styles.addButton}><AppText style={styles.addText}>{editingRate ? "Mettre à jour le taux" : "Enregistrer le taux"}</AppText></Pressable>{editingRate && <Pressable onPress={() => { setEditingRate(null); setRateBase(""); setRateQuote(""); setRateValue(""); setRateSource(""); }}><AppText style={styles.manageText}>Annuler</AppText></Pressable>}</Surface>}
      {!!(budgetError || error) && <AppText style={styles.error}>{budgetError || error}</AppText>}
      {!!notice && <AppText style={styles.notice}>{notice}</AppText>}
      <AppText style={styles.disclaimer}>Le budget et les lignes sont des prévisions; cette page ne réalise aucun paiement.</AppText>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 27, fontWeight: "900", color: C.ink },
  sub: { fontSize: 10, color: C.muted, lineHeight: 15 },
  hero: { backgroundColor: C.green, gap: 8 },
  heroLabel: { color: "#DCE9D5", fontSize: 9, fontWeight: "900" },
  total: { color: C.white, fontSize: 29, fontWeight: "900" },
  track: { height: 8, borderRadius: 6, backgroundColor: "rgba(255,255,255,.2)", overflow: "hidden", marginTop: 8 },
  fill: { height: "100%", backgroundColor: "#FFD000", borderRadius: 6 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  heroSub: { color: C.white, fontSize: 9 },
  primaryButton: { minHeight: 44, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  primaryText: { color: C.white, fontSize: 11, fontWeight: "900" },
  form: { gap: 8 },
  input: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 11, color: C.ink, fontSize: 11 },
  addRow: { flexDirection: "row", gap: 8 },
  addButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 10, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  addText: { color: C.white, fontSize: 10, fontWeight: "900" },
  line: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  lineIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#E7EBDC", alignItems: "center", justifyContent: "center" },
  lineIconText: { fontSize: 18, color: C.green, fontWeight: "900" },
  lineCategory: { fontSize: 11, color: C.ink, fontWeight: "800" },
  lineAmount: { fontSize: 11, color: C.green, fontWeight: "900" },
  rateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  error: { color: "#A7493C", fontSize: 11, fontWeight: "800" },
  notice: { color: C.green, fontSize: 11, fontWeight: "800" },
  disclaimer: { color: C.muted, fontSize: 9, textAlign: "center" }, managementRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }, manageActions: { flexDirection: "row", alignItems: "center", gap: 8 }, manageText: { color: C.green, fontSize: 9, fontWeight: "900" }, deleteText: { color: "#A7493C", fontSize: 9, fontWeight: "900" }, cancelButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 10, backgroundColor: "#F1F2EE", alignItems: "center", justifyContent: "center" },
});
