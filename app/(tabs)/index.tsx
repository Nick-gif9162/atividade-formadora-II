import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShopping } from '../../context/shoppingcontext';

const DICAS = [
  { emoji: '🥦', texto: 'Prefira alimentos com Nutri-Score A ou B.' },
  { emoji: '🧂', texto: 'Reduza o sodio: menos de 2g por dia e o ideal.' },
  { emoji: '🌿', texto: 'Alimentos NOVA 1 sao os mais naturais e saudaveis.' },
  { emoji: '💧', texto: 'Beba pelo menos 2L de agua por dia.' },
  { emoji: '🍎', texto: 'Frutas e vegetais devem ser metade do prato.' },
];

export default function Home() {
  const router = useRouter();
  const { itens } = useShopping();

  const pendentes = itens.filter(i => !i.comprado).length;
  const comprados = itens.filter(i => i.comprado).length;
  const ultimos3 = [...itens].reverse().slice(0, 3);
  const dica = DICAS[new Date().getDay() % DICAS.length];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>🛒 MercadoFácil</Text>
          <Text style={s.titulo}>
            Suas compras,{'\n'}
            <Text style={s.tituloDestaque}>sem esquecer nada.</Text>
          </Text>
          <Text style={s.descricao}>
            Monte sua lista e pesquise produtos com informações nutricionais.
          </Text>
        </View>

        {/* Dica do dia */}
        <View style={s.dicaCard}>
          <View style={s.dicaIconeWrap}>
            <Text style={s.dicaIcone}>{dica.emoji}</Text>
          </View>
          <View style={s.dicaTextoWrap}>
            <Text style={s.dicaTitulo}>Dica do dia</Text>
            <Text style={s.dicaTexto}>{dica.texto}</Text>
          </View>
        </View>

        {/* Cards de navegação */}
        <View style={s.cardsRow}>
          <TouchableOpacity
            style={[s.card, s.cardVerde]}
            onPress={() => router.push('/(tabs)/lista' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.cardIcon}>📋</Text>
            <Text style={s.cardTitulo}>Minha Lista</Text>
            <Text style={s.cardDesc}>Gerencie seus itens</Text>
            <View style={s.cardStats}>
              <View style={s.statItem}>
                <Text style={s.statNum}>{pendentes}</Text>
                <Text style={s.statLabel}>pendente{pendentes !== 1 ? 's' : ''}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statNum}>{comprados}</Text>
                <Text style={s.statLabel}>feito{comprados !== 1 ? 's' : ''}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.card, s.cardClaro]}
            onPress={() => router.push('/(tabs)/buscar' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.cardIcon}>🔍</Text>
            <Text style={[s.cardTitulo, { color: '#2d6a4f' }]}>Buscar</Text>
            <Text style={[s.cardDesc, { color: '#7a9080' }]}>Pesquise alimentos</Text>
            <View style={s.apiBadge}>
              <Text style={s.apiBadgeText}>Open Food Facts</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumo rápido */}
        {itens.length > 0 && (
          <View style={s.resumoRow}>
            <View style={[s.resumoItem, { backgroundColor: '#d8f3dc' }]}>
              <Text style={s.resumoEmoji}>✅</Text>
              <Text style={s.resumoNum}>{comprados}</Text>
              <Text style={s.resumoLabel}>comprado{comprados !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[s.resumoItem, { backgroundColor: '#fde8e4' }]}>
              <Text style={s.resumoEmoji}>⏳</Text>
              <Text style={s.resumoNum}>{pendentes}</Text>
              <Text style={s.resumoLabel}>pendente{pendentes !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[s.resumoItem, { backgroundColor: '#e8f5ee' }]}>
              <Text style={s.resumoEmoji}>🛒</Text>
              <Text style={s.resumoNum}>{itens.length}</Text>
              <Text style={s.resumoLabel}>total</Text>
            </View>
          </View>
        )}

        {/* Últimos 3 itens */}
        {ultimos3.length > 0 && (
          <View style={s.ultimosCard}>
            <View style={s.ultimosHeader}>
              <Text style={s.ultimosTitulo}>🕐 Adicionados recentemente</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lista' as any)}>
                <Text style={s.ultimosLink}>Ver lista →</Text>
              </TouchableOpacity>
            </View>

            {ultimos3.map((item, idx) => (
              <View
                key={item.id}
                style={[s.ultimoItem, idx === ultimos3.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={[s.ultimoCheck, item.comprado && s.ultimoCheckAtivo]}>
                  <Text style={[s.ultimoCheckText, item.comprado && { color: '#fff' }]}>
                    {item.comprado ? '✓' : '○'}
                  </Text>
                </View>
                <View style={s.ultimoInfo}>
                  <Text style={[s.ultimoNome, item.comprado && s.ultimoNomeRiscado]}>
                    {item.nome}
                  </Text>
                  <Text style={s.ultimoMeta}>
                    {item.quantidade} {item.unidade} · {item.categoria}
                  </Text>
                </View>
                <View style={[s.statusPill, item.comprado ? s.pillVerde : s.pillLaranja]}>
                  <Text style={[s.statusText, { color: item.comprado ? '#2d6a4f' : '#e76f51' }]}>
                    {item.comprado ? 'Feito' : 'Pendente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estado vazio */}
        {itens.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🛍️</Text>
            <Text style={s.emptyTitulo}>Lista vazia!</Text>
            <Text style={s.emptyTexto}>
              Toque em "Minha Lista" para adicionar itens,{'\n'}
              ou use "Buscar" para encontrar produtos.
            </Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => router.push('/(tabs)/lista' as any)}
            >
              <Text style={s.emptyBtnText}>Começar minha lista →</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fefae0' },
  container: { padding: 22, paddingTop: 44, paddingBottom: 44 },

  header: { marginBottom: 20 },
  logo: { fontSize: 18, fontWeight: '700', color: '#2d6a4f', marginBottom: 14 },
  titulo: { fontSize: 32, fontWeight: '900', color: '#3d2b1f', lineHeight: 40, marginBottom: 10 },
  tituloDestaque: { color: '#e76f51' },
  descricao: { fontSize: 14, color: '#5a7a65', lineHeight: 21 },

  dicaCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: '#52b788',
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  dicaIconeWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#e8f5ee', alignItems: 'center', justifyContent: 'center',
  },
  dicaIcone: { fontSize: 24 },
  dicaTextoWrap: { flex: 1 },
  dicaTitulo: { fontSize: 11, fontWeight: '700', color: '#52b788', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  dicaTexto: { fontSize: 13, color: '#3d2b1f', lineHeight: 18, fontWeight: '500' },

  cardsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  card: {
    flex: 1, borderRadius: 22, padding: 18,
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 14, elevation: 5, gap: 4,
  },
  cardVerde: { backgroundColor: '#2d6a4f' },
  cardClaro: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#b7e4c7' },
  cardIcon: { fontSize: 32, marginBottom: 4 },
  cardTitulo: { fontSize: 17, fontWeight: '900', color: '#fff' },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  cardStats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  apiBadge: { backgroundColor: '#b7e4c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginTop: 8 },
  apiBadgeText: { fontSize: 11, fontWeight: '700', color: '#2d6a4f' },

  resumoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  resumoItem: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 2 },
  resumoEmoji: { fontSize: 18 },
  resumoNum: { fontSize: 22, fontWeight: '900', color: '#3d2b1f' },
  resumoLabel: { fontSize: 10, fontWeight: '600', color: '#7a9080' },

  ultimosCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  ultimosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ultimosTitulo: { fontSize: 14, fontWeight: '800', color: '#3d2b1f' },
  ultimosLink: { fontSize: 13, color: '#2d6a4f', fontWeight: '700' },
  ultimoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f4f1eb',
  },
  ultimoCheck: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#f4f1eb', alignItems: 'center', justifyContent: 'center',
  },
  ultimoCheckAtivo: { backgroundColor: '#52b788' },
  ultimoCheckText: { fontSize: 14, color: '#9aada0', fontWeight: '700' },
  ultimoInfo: { flex: 1 },
  ultimoNome: { fontSize: 14, fontWeight: '700', color: '#3d2b1f' },
  ultimoNomeRiscado: { textDecorationLine: 'line-through', color: '#bbb' },
  ultimoMeta: { fontSize: 11, color: '#9aada0', marginTop: 1 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  pillVerde: { backgroundColor: '#d8f3dc' },
  pillLaranja: { backgroundColor: '#fde8e4' },
  statusText: { fontSize: 11, fontWeight: '700' },

  emptyCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 28,
    alignItems: 'center', gap: 10,
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 4 },
  emptyTitulo: { fontSize: 20, fontWeight: '900', color: '#3d2b1f' },
  emptyTexto: { fontSize: 13, color: '#9aada0', textAlign: 'center', lineHeight: 20 },
  emptyBtn: { backgroundColor: '#2d6a4f', borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});