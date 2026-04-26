import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, Modal, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShopping } from '../../context/shoppingcontext';

// Preços sugeridos por categoria (valores médios mercados brasileiros 2025)
const PRECOS: Record<string, { preco: number; label: string }[]> = {
  default: [
    { preco: 2.99, label: 'R$ 2,99' }, { preco: 4.99, label: 'R$ 4,99' },
    { preco: 7.99, label: 'R$ 7,99' }, { preco: 12.90, label: 'R$ 12,90' },
    { preco: 19.90, label: 'R$ 19,90' },
  ],
  Laticinios: [
    { preco: 5.49, label: 'R$ 5,49' }, { preco: 7.90, label: 'R$ 7,90' },
    { preco: 9.99, label: 'R$ 9,99' }, { preco: 14.90, label: 'R$ 14,90' },
    { preco: 22.90, label: 'R$ 22,90' },
  ],
  Carnes: [
    { preco: 18.90, label: 'R$ 18,90' }, { preco: 24.90, label: 'R$ 24,90' },
    { preco: 34.90, label: 'R$ 34,90' }, { preco: 49.90, label: 'R$ 49,90' },
    { preco: 69.90, label: 'R$ 69,90' },
  ],
  Padaria: [
    { preco: 3.49, label: 'R$ 3,49' }, { preco: 5.99, label: 'R$ 5,99' },
    { preco: 8.90, label: 'R$ 8,90' }, { preco: 11.90, label: 'R$ 11,90' },
    { preco: 15.90, label: 'R$ 15,90' },
  ],
  Bebidas: [
    { preco: 3.99, label: 'R$ 3,99' }, { preco: 6.99, label: 'R$ 6,99' },
    { preco: 9.90, label: 'R$ 9,90' }, { preco: 13.90, label: 'R$ 13,90' },
    { preco: 18.90, label: 'R$ 18,90' },
  ],
  Doces: [
    { preco: 4.49, label: 'R$ 4,49' }, { preco: 6.99, label: 'R$ 6,99' },
    { preco: 9.90, label: 'R$ 9,90' }, { preco: 14.90, label: 'R$ 14,90' },
    { preco: 19.90, label: 'R$ 19,90' },
  ],
  Mercearia: [
    { preco: 4.99, label: 'R$ 4,99' }, { preco: 7.49, label: 'R$ 7,49' },
    { preco: 9.90, label: 'R$ 9,90' }, { preco: 14.90, label: 'R$ 14,90' },
    { preco: 22.90, label: 'R$ 22,90' },
  ],
  Higiene: [
    { preco: 4.99, label: 'R$ 4,99' }, { preco: 8.90, label: 'R$ 8,90' },
    { preco: 12.90, label: 'R$ 12,90' }, { preco: 18.90, label: 'R$ 18,90' },
    { preco: 27.90, label: 'R$ 27,90' },
  ],
  Limpeza: [
    { preco: 3.49, label: 'R$ 3,49' }, { preco: 5.99, label: 'R$ 5,99' },
    { preco: 9.90, label: 'R$ 9,90' }, { preco: 14.90, label: 'R$ 14,90' },
    { preco: 24.90, label: 'R$ 24,90' },
  ],
};

// Função que pega no valor médio (o do meio) da categoria escolhida
function getPrecoAutomatico(categoria: string, nomeProduto: string) {
  const chave = Object.keys(PRECOS).find(k =>
    k !== 'default' && categoria.toLowerCase().includes(k.toLowerCase())
  );
  const listaCat = PRECOS[chave ?? 'default'];
  
  // Cria um índice "sorteado" mas fixo baseado nas letras do nome do produto.
  // Garante que produtos diferentes tenham preços diferentes!
  const somaLetras = nomeProduto.split('').reduce((acc, letra) => acc + letra.charCodeAt(0), 0);
  const indice = somaLetras % listaCat.length;
  
  return listaCat[indice].preco; 
}

export default function Lista() {
  const router = useRouter();

  const {
    itens,
    removerItem,
    removerUma,
    adicionarUma,
    atualizarPreco,
    toggleComprado,
    limparComprados,
    limparTudo,
  } = useShopping();

  const [modalFinalizar, setModalFinalizar] = useState(false);

  // EFEITO AUTOMÁTICO: Observa a lista. Se entrar algum item sem preço (ou preço 0),
  // ele define o preço médio automaticamente em segundo plano.
  useEffect(() => {
    const itensSemPreco = itens.filter(i => !i.preco || i.preco === 0);
    if (itensSemPreco.length > 0) {
      itensSemPreco.forEach(item => {
        const precoMedio = getPrecoAutomatico(item.categoria, item.nome);
        atualizarPreco(item.id, precoMedio);
      });
    }
  }, [itens]);

  const pendentes = itens.filter(i => !i.comprado).length;
  const comprados = itens.filter(i => i.comprado).length;

  const totalGeral = itens.reduce((acc, i) =>
    i.preco ? acc + i.preco * i.quantidade : acc, 0
  );
  const totalComprados = itens
    .filter(i => i.comprado)
    .reduce((acc, i) => i.preco ? acc + i.preco * i.quantidade : acc, 0);

  const confirmarRemover = (id: any, nome: string, quantidade: number) => {
      const executarRemocao = () => removerItem(id);

      // 🌐 COMPORTAMENTO PARA NAVEGADOR (WEB)
      if (Platform.OS === 'web') {
        if (quantidade > 1) {
          // Na web o alerta só tem OK e Cancelar, então adaptamos a pergunta:
          const removerTudo = window.confirm(
            `"${nome}" tem ${quantidade} unidades.\n\nClique "OK" para remover TODAS.\nClique "Cancelar" para remover apenas UMA.`
          );
          if (removerTudo) {
            executarRemocao();
          } else {
            removerUma(id);
          }
        } else {
          const confirmar = window.confirm(`Deseja remover "${nome}" da lista?`);
          if (confirmar) {
            executarRemocao();
          }
        }
        return; 
      }


      if (quantidade > 1) {
        Alert.alert(
          '🗑️ Remover item',
          `"${nome}" tem ${quantidade} unidades. O que deseja fazer?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover 1', onPress: () => removerUma(id) },
            { text: 'Remover Tudo', style: 'destructive', onPress: executarRemocao },
          ]
        );
      } else {
        Alert.alert(
          '🗑️ Remover',
          `Deseja remover "${nome}"?`,
          [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim, remover', style: 'destructive', onPress: executarRemocao },
          ]
        );
      }
    };

  const handleFinalizar = () => {
    if (itens.length === 0) {
      Alert.alert('Lista vazia', 'Adicione itens antes de finalizar!');
      return;
    }
    setModalFinalizar(true);
  };
  const handleConfirmarFinalizar = () => {
      // 1. Fecha o modal imediatamente
      setModalFinalizar(false);
      
      // 2. Limpa a lista por completo (usa a função do seu context)
      limparTudo();
      
      // 3. Exibe a mensagem de sucesso para o usuário
      setTimeout(() => {
        Alert.alert(
          '🎉 Compra Finalizada!',
          'Sua lista foi comprada e limpa com sucesso. Até a próxima!',
          [{ text: 'OK', onPress: () => console.log('Lista limpa') }]
        );
      }, 500); // Pequeno atraso para o modal fechar suavemente antes do alerta
    };
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <Text style={s.titulo}>📋 Minha Lista</Text>
          <Text style={s.subtitulo}>Adicione e gerencie seus itens</Text>
        </View>

        {/* Resumo verde */}
        <View style={s.resumo}>
          <Text style={s.resumoText}>🛒 {itens.length} {itens.length === 1 ? 'item' : 'itens'}</Text>
          <Text style={s.resumoText}>✅ {comprados} comprado{comprados !== 1 ? 's' : ''}</Text>
          <Text style={s.resumoText}>⏳ {pendentes} pendente{pendentes !== 1 ? 's' : ''}</Text>
          {comprados > 0 && (
            <TouchableOpacity
              style={s.btnLimpar}
              onPress={() =>
                Alert.alert(
                  'Limpar comprados',
                  `Remover ${comprados} item${comprados !== 1 ? 's' : ''} comprado${comprados !== 1 ? 's' : ''}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Limpar', style: 'destructive', onPress: limparComprados },
                  ]
                )
              }
            >
              <Text style={s.btnLimparText}>Limpar ✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão ir para busca */}
        <TouchableOpacity
          style={s.btnBuscar}
          onPress={() => router.push('/(tabs)/buscar' as any)}
          activeOpacity={0.85}
        >
          <Text style={s.btnBuscarIcon}>🔍</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.btnBuscarText}>Adicionar produto</Text>
            <Text style={s.btnBuscarSub}>Buscar na base do Open Food Facts</Text>
          </View>
          <Text style={s.btnBuscarSeta}>→</Text>
        </TouchableOpacity>

        {/* Lista vazia */}
        {itens.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🛍️</Text>
            <Text style={s.emptyText}>Sua lista está vazia!</Text>
            <Text style={s.emptySubText}>
              Toque em "Adicionar produto" acima{'\n'}para buscar e adicionar itens.
            </Text>
          </View>
        )}

        {/* Itens */}
        {itens.length > 0 && (
          <View style={s.listaContainer}>
            <Text style={s.listaLabel}>ITENS DA LISTA</Text>

            {itens.map(item => {
              // Preço de fallback visual, caso o useEffect demore uns milissegundos
              const precoExibicao = item.preco || getPrecoAutomatico(item.categoria, item.nome);

              return (
                <View key={item.id} style={[s.item, item.comprado && s.itemComprado]}>

                  {/* Linha principal */}
                  <View style={s.itemLinha}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={[s.checkBtn, item.comprado && s.checkBtnAtivo]}
                      onPress={() => toggleComprado(item.id)}
                    >
                      {item.comprado && <Text style={s.checkIcon}>✓</Text>}
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={s.itemInfo}>
                      <Text style={[s.itemNome, item.comprado && s.itemNomeRiscado]} numberOfLines={1}>
                        {item.nome}
                      </Text>
                      <Text style={s.itemCategoria}>{item.categoria}</Text>
                    </View>

                    {/* Controles − qty + */}
                    <View style={s.qtyControles}>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => {
                          if (item.quantidade === 1) {
                            confirmarRemover(item.id, item.nome, 1);
                          } else {
                            removerUma(item.id);
                          }
                        }}
                      >
                        <Text style={s.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyNum}>{item.quantidade}</Text>
                      <TouchableOpacity style={s.qtyBtn} onPress={() => adicionarUma(item.id)}>
                        <Text style={s.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Remover */}
                    <TouchableOpacity
                      style={s.btnRemover}
                      onPress={() => confirmarRemover(item.id, item.nome, item.quantidade)}
                    >
                      <Text style={s.btnRemoverText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Seção de preço (agora muito mais simples e limpa) */}
                  <View style={s.precoSecao}>
                    <View style={s.precoAtualRow}>
                      <View style={s.precoTag}>
                        <Text style={s.precoTagText}>R$ {precoExibicao.toFixed(2).replace('.', ',')}</Text>
                      </View>
                      <Text style={s.precoSubtotal}>
                        × {item.quantidade} = R$ {(precoExibicao * item.quantidade).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  </View>

                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Barra total flutuante */}
      {itens.length > 0 && (
        <View style={s.barraTotal}>
          <View style={s.barraTotalInfo}>
            <Text style={s.barraTotalLabel}>TOTAL ESTIMADO</Text>
            <Text style={s.barraTotalValor}>R$ {totalGeral.toFixed(2).replace('.', ',')}</Text>
          </View>
          <TouchableOpacity style={s.btnFinalizar} onPress={handleFinalizar} activeOpacity={0.85}>
            <Text style={s.btnFinalizarText}>Finalizar 🛒</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de finalização */}
      <Modal visible={modalFinalizar} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalEmoji}>🎉</Text>
            <Text style={s.modalTitulo}>Pronto para finalizar?</Text>
            <Text style={s.modalSub}>Resumo das suas compras</Text>

            <View style={s.modalResumo}>
              <View style={s.modalRow}>
                <Text style={s.modalRowLabel}>🛒 Total de itens</Text>
                <Text style={s.modalRowValor}>{itens.length}</Text>
              </View>
              <View style={s.modalRow}>
                <Text style={s.modalRowLabel}>✅ Comprados</Text>
                <Text style={s.modalRowValor}>{comprados}</Text>
              </View>
              <View style={s.modalRow}>
                <Text style={s.modalRowLabel}>⏳ Pendentes</Text>
                <Text style={s.modalRowValor}>{pendentes}</Text>
              </View>
              {totalComprados > 0 && (
                <View style={s.modalRow}>
                  <Text style={s.modalRowLabel}>💳 Já gasto</Text>
                  <Text style={s.modalRowValor}>R$ {totalComprados.toFixed(2).replace('.', ',')}</Text>
                </View>
              )}
              {totalGeral > 0 && (
                <View style={[s.modalRow, s.modalRowDestaque]}>
                  <Text style={[s.modalRowLabel, { color: '#2d6a4f', fontWeight: '800' }]}>💰 Total estimado</Text>
                  <Text style={[s.modalRowValor, { color: '#2d6a4f', fontSize: 18 }]}>
                    R$ {totalGeral.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              )}
            </View>

            {pendentes > 0 && (
              <View style={s.modalAvisoPendente}>
                <Text style={s.modalAvisoPendenteText}>
                  Ainda há {pendentes} item{pendentes !== 1 ? 's' : ''} pendente{pendentes !== 1 ? 's' : ''} na lista.
                </Text>
              </View>
            )}

            <View style={s.modalBotoes}>
              <TouchableOpacity style={s.modalBtnCancelar} onPress={() => setModalFinalizar(false)}>
                <Text style={s.modalBtnCancelarText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalBtnConfirmar} onPress={handleConfirmarFinalizar}>
                <Text style={s.modalBtnConfirmarText}>Finalizar ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fefae0' },
  container: { padding: 20, paddingTop: 40 },

  header: { marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: '900', color: '#2d6a4f', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#7a9080' },

  resumo: {
    backgroundColor: '#2d6a4f', borderRadius: 16, padding: 16,
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  resumoText: { color: '#fefae0', fontSize: 13, fontWeight: '500' },
  btnLimpar: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  btnLimparText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  btnBuscar: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16,
    borderWidth: 2, borderColor: '#b7e4c7',
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  btnBuscarIcon: { fontSize: 28 },
  btnBuscarText: { fontSize: 16, fontWeight: '800', color: '#2d6a4f' },
  btnBuscarSub: { fontSize: 12, color: '#7a9080', marginTop: 2 },
  btnBuscarSeta: { fontSize: 20, color: '#52b788', fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#3d2b1f' },
  emptySubText: { fontSize: 14, color: '#9aada0', marginTop: 6, textAlign: 'center', lineHeight: 21 },

  listaContainer: { gap: 12 },
  listaLabel: { fontSize: 11, fontWeight: '700', color: '#9aada0', letterSpacing: 1, marginBottom: 4 },

  item: {
    backgroundColor: '#fff', borderRadius: 18,
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, overflow: 'hidden',
  },
  itemComprado: { opacity: 0.55 },

  itemLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, paddingBottom: 10 },

  checkBtn: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: '#52b788', alignItems: 'center', justifyContent: 'center',
  },
  checkBtnAtivo: { backgroundColor: '#52b788' },
  checkIcon: { color: '#fff', fontSize: 14, fontWeight: '900' },

  itemInfo: { flex: 1 },
  itemNome: { fontSize: 14, fontWeight: '700', color: '#3d2b1f' },
  itemNomeRiscado: { textDecorationLine: 'line-through', color: '#bbb' },
  itemCategoria: { fontSize: 11, color: '#9aada0', marginTop: 1 },

  qtyControles: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#e8f5ee', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#2d6a4f', lineHeight: 22 },
  qtyNum: { fontSize: 15, fontWeight: '800', color: '#3d2b1f', minWidth: 22, textAlign: 'center' },

  btnRemover: {
    backgroundColor: '#fde8e4', width: 28, height: 28,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  btnRemoverText: { color: '#e76f51', fontWeight: '700', fontSize: 13 },

  precoSecao: {
    borderTopWidth: 1, borderTopColor: '#f0ede8',
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12, gap: 8,
  },

  precoAtualRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  precoTag: { backgroundColor: '#e8f5ee', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#b7e4c7' },
  precoTagText: { fontSize: 13, fontWeight: '800', color: '#2d6a4f' },
  precoSubtotal: { fontSize: 13, fontWeight: '700', color: '#e76f51' },

  barraTotal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8f5ee',
    paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
  },
  barraTotalInfo: { flex: 1 },
  barraTotalLabel: { fontSize: 10, color: '#9aada0', fontWeight: '700', letterSpacing: 0.5 },
  barraTotalValor: { fontSize: 22, fontWeight: '900', color: '#2d6a4f' },
  btnFinalizar: { backgroundColor: '#2d6a4f', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  btnFinalizarText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', gap: 12 },
  modalEmoji: { fontSize: 48, textAlign: 'center' },
  modalTitulo: { fontSize: 22, fontWeight: '900', color: '#2d6a4f', textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#7a9080', textAlign: 'center' },
  modalResumo: { backgroundColor: '#f8fbf8', borderRadius: 16, padding: 14, gap: 8 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalRowDestaque: { backgroundColor: '#e8f5ee', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 4 },
  modalRowLabel: { fontSize: 14, color: '#5a7a65' },
  modalRowValor: { fontSize: 15, fontWeight: '800', color: '#3d2b1f' },
  modalAvisoPendente: { backgroundColor: '#fde8e4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#f9c5b8' },
  modalAvisoPendenteText: { fontSize: 13, color: '#c0392b', textAlign: 'center' },
  modalBotoes: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtnCancelar: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#f4f1eb' },
  modalBtnCancelarText: { color: '#7a9080', fontWeight: '700', fontSize: 14 },
  modalBtnConfirmar: { flex: 2, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#2d6a4f' },
  modalBtnConfirmarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});