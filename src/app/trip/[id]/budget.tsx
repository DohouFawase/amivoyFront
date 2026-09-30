import { AppText, AppTextInput } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  BottomBar,
  C,
  Header,
  Page,
  SectionTitle,
  Surface,
} from "@/components/app-ui";
import { expenses, trips } from "@/data/mock";
import { formatXof } from "@/data/currency";
import { recordGroupActivity } from "@/data/group-activity";
export default function Budget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = trips.find((t) => t.id === id) ?? trips[0];
  const [added, setAdded] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [extraExpenses, setExtraExpenses] = useState<{name:string;amount:number}[]>([]);
  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <Page>
        <Header back title="Budget du voyage" />
        <AppText style={{ fontSize: 27, fontWeight: "900", color: C.ink }}>
          Les comptes sont clairs.
        </AppText>
        <AppText style={{ fontSize: 12, color: C.muted, marginTop: -13 }}>
          Suivez les dépenses du groupe, sans prise de tête.
        </AppText>
        <Surface style={st.hero}>
          <AppText style={{ fontSize: 11, color: "#DCE9D5" }}>BUDGET TOTAL</AppText>
          <AppText
            style={{
              fontSize: 35,
              color: "#fff",
              fontWeight: "900",
              marginTop: 6,
            }}
          >
            {formatXof(trip.budget)}
          </AppText>
          <View style={st.bar}>
            <View
              style={[
                st.barFill,
                { width: `${(trip.spent / trip.budget) * 100}%` },
              ]}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 9,
            }}
          >
            <AppText style={{ fontSize: 11, color: "#fff" }}>
              Dépensé {formatXof(trip.spent)}
            </AppText>
            <AppText style={{ fontSize: 11, color: "#fff" }}>
              Reste {formatXof(trip.budget - trip.spent)}
            </AppText>
          </View>
        </Surface>
        <View style={st.cards}>
          <Surface style={st.stat}>
            <AppText style={{ fontSize: 19 }}>↗</AppText>
            <AppText style={st.statNum}>78 700 FCFA</AppText>
            <AppText style={st.statLabel}>Ta part estimée</AppText>
          </Surface>
          <Surface style={st.stat}>
            <AppText style={{ fontSize: 19 }}>⇄</AppText>
            <AppText style={st.statNum}>18 400 FCFA</AppText>
            <AppText style={st.statLabel}>Tu dois au groupe</AppText>
          </Surface>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SectionTitle title="Dépenses récentes" />
          <Pressable onPress={() => setAdded(true)} style={st.add}>
            <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
          </Pressable>
        </View>
        {added && (
          <Surface style={{gap:9}}>
            <AppTextInput value={expenseName} onChangeText={setExpenseName} placeholder="Nom de la dépense" style={st.expenseInput}/>
            <AppTextInput value={amount} onChangeText={setAmount} placeholder="Montant en FCFA" keyboardType="decimal-pad" style={st.expenseInput}/>
            <Pressable style={st.saveExpense} onPress={()=>{const value=Number(amount.replace(',','.'));if(expenseName.trim()&&value>0){setExtraExpenses([{name:expenseName.trim(),amount:value},...extraExpenses]);recordGroupActivity({category:"trip",groupId:trip.id,groupName:trip.title,title:"Une dépense a été ajoutée",description:`${expenseName.trim()} · ${formatXof(value)}`,actor:"Toi",icon:"payments",href:`/trip/${trip.id}/budget`});setExpenseName("");setAmount("");setAdded(false);}}}><AppText style={{color:C.white,fontWeight:"900",fontSize:11}}>Ajouter au budget démo</AppText></Pressable>
          </Surface>
        )}
        {extraExpenses.map((item,index)=><Surface key={`${item.name}-${index}`} style={st.expense}><View style={[st.icon,{backgroundColor:'#E7EBDC'}]}><AppIcon name="receipt_long" size={19} /></View><View style={{flex:1}}><AppText style={{fontSize:12,fontWeight:'800',color:C.ink}}>{item.name}</AppText><AppText style={{fontSize:10,color:C.muted,marginTop:3}}>À l’instant · payé par Toi</AppText></View><AppText style={{fontWeight:'900',color:C.ink}}>{formatXof(item.amount)}</AppText></Surface>)}
        {expenses.map((e, i) => (
          <Surface key={e.name} style={st.expense}>
            <View style={[st.icon, { backgroundColor: e.color }]}>
              <AppIcon name={e.emoji} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 12, fontWeight: "800", color: C.ink }}>
                {e.name}
              </AppText>
              <AppText style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                {
                  [
                    "Hier · payé par",
                    "Aujourd’hui · payé par",
                    "Aujourd’hui · payé par",
                  ][i]
                }{" "}
                {e.who}
              </AppText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <AppText style={{ fontWeight: "900", color: C.ink }}>
                {formatXof(e.amount)}
              </AppText>
              <AppText style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>
                partagé à 4
              </AppText>
            </View>
          </Surface>
        ))}
        <SectionTitle title="Répartition par catégorie" />
        <Surface style={{ gap: 12 }}>
          {[
            ["Hébergement", 157440, "#789477"],
            ["Restaurants", 98400, "#E6AA78"],
            ["Activités", 62300, "#8CA4A1"],
          ].map((a) => (
            <View key={a[0] as string} style={st.category}>
              <AppText style={{ fontSize: 11, color: C.ink, flex: 1 }}>
                {a[0]}
              </AppText>
              <View style={st.catBar}>
                <View
                  style={{
                    width: `${(Number(a[1]) / 200000) * 100}%`,
                    height: 7,
                    backgroundColor: a[2] as string,
                    borderRadius: 6,
                  }}
                />
              </View>
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  width: 92,
                  textAlign: "right",
                }}
              >
                {formatXof(Number(a[1]))}
              </AppText>
            </View>
          ))}
        </Surface>
      </Page>
      <BottomBar />
    </View>
  );
}
const st = StyleSheet.create({
  hero: { backgroundColor: C.green, borderRadius: 22, padding: 19 },
  bar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,.2)",
    borderRadius: 8,
    marginTop: 16,
    overflow: "hidden",
  },
  barFill: { height: 8, backgroundColor: "#FFD000", borderRadius: 8 },
  cards: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, gap: 4 },
  statNum: { fontSize: 18, fontWeight: "900", color: C.ink },
  statLabel: { fontSize: 10, color: C.muted },
  add: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  added: { padding: 12 },
  expenseInput: { height: 43, backgroundColor: "#F8F8F3", borderRadius: 12, paddingHorizontal: 12, color: C.ink, fontSize: 11 },
  saveExpense: { backgroundColor: C.green, padding: 12, alignItems: "center", borderRadius: 12 },
  expense: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12 },
  icon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  category: { flexDirection: "row", alignItems: "center", gap: 8 },
  catBar: { width: 90, height: 7, backgroundColor: C.pale, borderRadius: 5 },
});
