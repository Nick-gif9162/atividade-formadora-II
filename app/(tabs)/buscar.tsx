import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, Image, ActivityIndicator, Animated,
} from 'react-native';
import { useShopping } from '../../context/shoppingcontext';

interface Produto {
  id?: string; _id?: string;
  product_name: string; brands?: string;
  image_front_small_url?: string; image_url?: string;
  nutriscore_grade?: string; nutrition_grade_fr?: string;
  nova_group?: number;
  nutriments?: {
    'energy-kcal_100g'?: number; 'energy-kcal'?: number;
    proteins_100g?: number; carbohydrates_100g?: number;
    fat_100g?: number; fiber_100g?: number;
    sugars_100g?: number; sodium_100g?: number; salt_100g?: number;
  };
  categories_tags?: string[]; quantity?: string; ingredients_text?: string;
}

interface Sub { nome: string; termos: string[]; emoji: string; }
interface Cat { emoji: string; nome: string; termos: string[]; subs: Sub[]; }

const CATEGORIAS: Cat[] = [
  {
    emoji: '🥛', nome: 'Laticinios', termos: ['leite integral', 'leite longa vida'],
    subs: [
      { emoji: '🥛', nome: 'Leite', termos: ['leite integral', 'leite desnatado', 'leite longa vida']},
      { emoji: '🧀', nome: 'Queijo Amarelo', termos: ['queijo prato fatiado', 'queijo cheddar', 'queijo gouda']},
      { emoji: '🫕', nome: 'Queijo Branco', termos: ['queijo mussarela', 'queijo minas frescal', 'queijo ricota']},
      { emoji: '🥇', nome: 'Queijo Especial', termos: ['queijo parmesao', 'queijo gorgonzola', 'queijo brie']},
      { emoji: '🍦', nome: 'Iogurte', termos: ['iogurte natural integral', 'iogurte grego', 'iogurte bebivel']},
      { emoji: '🧈', nome: 'Manteiga', termos: ['manteiga com sal', 'margarina vegetal', 'creme de leite']},
    ],
  },
  {
    emoji: '🥩', nome: 'Carnes', termos: ['carne bovina', 'frango peito'],
    subs: [
      { emoji: '🐄', nome: 'Bovina', termos: ['carne bovina picanha', 'alcatra contrafile', 'carne moida']},
      { emoji: '🐷', nome: 'Suina', termos: ['lombo suino', 'costelinha porco', 'pernil suino']},
      { emoji: '🐟', nome: 'Peixe Frutos', termos: ['salmao defumado', 'camarao congelado', 'corvina file', 'bacalhau salgado', 'tilapia file', 'atum solido lata', 'sardinha lata']},
      { emoji: '🍗', nome: 'Frango', termos: ['frango peito file', 'coxa sobrecoxa frango', 'frango inteiro']},
      { emoji: '🌭', nome: 'Frios', termos: ['presunto cozido fatiado', 'mortadela defumada', 'peito de peru fatiado']},
    ],
  },
  {
    emoji: '🍞', nome: 'Padaria', termos: ['pao de forma', 'biscoito'],
    subs: [
      { emoji: '🍞', nome: 'Paes', termos: ['pao de forma integral', 'pao hamburger brioche', 'pao tradicional']},
      { emoji: '🍪', nome: 'Biscoitos', termos: ['biscoito cream cracker', 'bolacha maisena', 'biscoito recheado']},
      { emoji: '🥣', nome: 'Cereais', termos: ['granola frutas secas', 'aveia em flocos', 'cereal matinal']},
      { emoji: '🎂', nome: 'Bolos', termos: ['bolo de chocolate pronto', 'bolo de cenoura', 'mistura para bolo fleischmann']},
    ],
  },
  {
    emoji: '🥤', nome: 'Bebidas', termos: ['suco laranja', 'refrigerante guarana'],
    subs: [
      { emoji: '🧃', nome: 'Sucos', termos: ['suco de manga','suco laranja natural', 'nectar uva fruta', 'suco integral polpa']},
      // Refrigerante: termos com marcas especificas funcionam melhor no mobile
      { emoji: '🥤', nome: 'Refrigerante', termos: ['guarana antarctica lata', 'coca cola', 'pepsi']},
      // Cafe: termo simples sem acento funciona melhor
      { emoji: '☕', nome: 'Cafe Cha', termos: ['café torrado e moído', 'café solúvel', 'café em cápsula', 'café em pó']},
      // Agua: termo mais especifico
      { emoji: '💧', nome: 'Agua Iso', termos: ['água mineral', 'água sem gás', 'água com gás']},
      { emoji: '🍺', nome: 'Cerveja', termos: ['cerveja pilsen', 'cerveja puro malte', 'cerveja lager', 'cerveja ipa']},
      { emoji: '🍷', nome: 'Vinho', termos: ['vinho de mesa','vinho tinto', 'vinho branco', 'vinho rose']},
    ],
  },
  {
    emoji: '🍫', nome: 'Doces', termos: ['chocolate ao leite', 'doce'],
    subs: [
      { emoji: '🍫', nome: 'Chocolate', termos: ['chocolate ao leite lacta', 'chocolate amargo 70 cacau', 'chocolate branco garoto'] },
      { emoji: '🍬', nome: 'Balas', termos: ['bala de goma fini', 'drops halls mentol', 'pirulito'] },
      { emoji: '🍯', nome: 'Mel Geleia', termos: ['mel puro silvestre', 'geleia de morango queensberry', 'doce de leite nestle'] },
      { emoji: '🍮', nome: 'Sobremesas', termos: ['pudim de leite nestle', 'gelatina royal', 'sorvete kibon'] },
    ],
  },
  {
    emoji: '🫙', nome: 'Mercearia', termos: ['arroz branco', 'feijao carioca'],
    subs: [
      { emoji: '🍚', nome: 'Arroz', termos: ['arroz branco camil tipo 1', 'arroz integral tio joao', 'arroz parboilizado']},
      { emoji: '🫘', nome: 'Feijao', termos: ['feijao carioca camil', 'feijao preto pacote', 'lentilha verde']},
      { emoji: '🍝', nome: 'Massas', termos: ['macarrao espaguete barilla', 'macarrao penne massa', 'macarrao parafuso']},
      { emoji: '🛢️', nome: 'Oleos', termos: ['azeite oliva extra virgem', 'oleo soja leve', 'oleo girassol'] },
      { emoji: '🧂', nome: 'Temperos', termos: ['sal refinado iodado', 'acucar cristal uniao', 'farinha trigo'] },
      { emoji: '🥫', nome: 'Conservas', termos: ['atum solido oleo lata', 'milho verde lata bonduelle', 'ervilha lata'] },
    ],
  },
  {
    emoji: '🧴', nome: 'Higiene', termos: ['sabonete dove', 'shampoo pantene'],
    subs: [
      { emoji: '🧼', nome: 'Sabonete', termos: ['sabonete dove original', 'sabonete lux suave', 'sabonete palmolive']},
      { emoji: '🧴', nome: 'Shampoo', termos: ['shampoo pantene hidratacao', 'shampoo seda liso', 'shampoo head shoulders'] },
      { emoji: '💆', nome: 'Condicionador', termos: ['condicionador pantene', 'condicionador tresemme', 'condicionador elseve'] },
      { emoji: '🪥', nome: 'Dental', termos: ['creme dental colgate total', 'pasta dente oral b', 'creme dental sensodyne'] },
      { emoji: '🧻', nome: 'Papel', termos: ['papel higienico neve folha dupla', 'papel higienico personal', 'lenco papel kleenex'] },
      { emoji: '🌸', nome: 'Desodorante', termos: ['desodorante rexona women', 'desodorante nivea original', 'desodorante dove'] },
    ],
  },
  {
    emoji: '🧹', nome: 'Limpeza', termos: ['detergente ype', 'sabao em po omo'],
    subs: [
      { emoji: '🫧', nome: 'Detergente', termos: ['detergente ype neutro', 'detergente ajax limao', 'detergente limpeza louça']},
      { emoji: '👕', nome: 'Roupas', termos: ['sabao em po omo multiacao', 'amaciante downy', 'sabao em po ariel']},
      { emoji: '🧽', nome: 'Multiuso', termos: ['desinfetante pinho sol', 'multiuso veja cozinha', 'agua sanitaria qboa']},
    ],
  },
];

const NOVA: Record<number, { label: string; cor: string; emoji: string }> = {
  1: { label: 'Nao processado', cor: '#1e7e34', emoji: '🌿' },
  2: { label: 'Ing. culinario', cor: '#5a9e1a', emoji: '🫒' },
  3: { label: 'Processado', cor: '#e6b800', emoji: '⚠️' },
  4: { label: 'Ultraprocessado', cor: '#c0392b', emoji: '🔴' },
};
const NS_COR: Record<string, string> = {
  a: '#1e7e34', b: '#5a9e1a', c: '#e6b800', d: '#d16a00', e: '#c0392b',
};

function fmt(v?: number, c = 1) { return (v !== undefined && v !== null) ? v.toFixed(c) : null; }

function NutriRow({ emoji, label, valor, dest }: { emoji: string; label: string; valor: string | null; dest?: boolean }) {
  if (!valor) return null;
  return (
    <View style={[nr.row, dest && nr.dest]}>
      <Text style={nr.e}>{emoji}</Text>
      <Text style={[nr.l, dest && nr.ld]}>{label}</Text>
      <Text style={[nr.v, dest && nr.vd]}>{valor}</Text>
    </View>
  );
}
const nr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0ede6', gap: 8 },
  dest: { backgroundColor: '#fff9f0', borderRadius: 8, paddingHorizontal: 6, borderBottomWidth: 0, marginBottom: 4 },
  e: { fontSize: 14, width: 20 },
  l: { flex: 1, fontSize: 13, color: '#5a7a65', fontWeight: '500' },
  ld: { fontWeight: '700', color: '#3d2b1f' },
  v: { fontSize: 13, fontWeight: '700', color: '#3d2b1f' },
  vd: { fontSize: 15, color: '#e76f51' },
});

function Toast({ visible, nome, tipo }: { visible: boolean; nome: string; tipo: 'adicionado' | 'aumentado' }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: visible ? 1 : 0, duration: visible ? 250 : 300, useNativeDriver: true }),
      Animated.timing(ty, { toValue: visible ? 0 : 30, duration: visible ? 250 : 300, useNativeDriver: true }),
    ]).start();
  }, [visible]);
  return (
    <Animated.View style={[tk.box, { opacity: op, transform: [{ translateY: ty }] }]} pointerEvents="none">
      <Text style={tk.ico}>{tipo === 'aumentado' ? '➕' : '✅'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={tk.tit}>{tipo === 'aumentado' ? 'Quantidade aumentada!' : 'Adicionado a lista!'}</Text>
        <Text style={tk.nome} numberOfLines={1}>{nome}</Text>
      </View>
    </Animated.View>
  );
}
const tk = StyleSheet.create({
  box: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: '#2d6a4f', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 12, zIndex: 999,
  },
  ico: { fontSize: 26 },
  tit: { color: '#fff', fontWeight: '800', fontSize: 14 },
  nome: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
});

function fetchTimeout(url: string, ms = 12000): Promise<Response> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(url)
      .then(r => { clearTimeout(t); resolve(r); })
      .catch(e => { clearTimeout(t); reject(e); });
  });
}

async function buscarComFallback(termos: string[]): Promise<{ produtos: Produto[]; erro: string }> {
  for (const termo of termos) {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(termo)}&search_simple=1&action=process&json=1&page_size=30&lc=pt&countries_tags=brazil&fields=product_name,brands,image_front_small_url,image_url,nutriscore_grade,nutrition_grade_fr,nova_group,nutriments,categories_tags,quantity,ingredients_text`;
      const res = await fetchTimeout(url);
      if (res.ok) {
        const d = await res.json();
        const lista = (d.products || []).filter((p: Produto) => p.product_name && p.product_name.trim() !== '');
        if (lista.length >= 3) return { produtos: lista, erro: '' };
      }
    } catch {}
    try {
      const url2 = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(termo)}&search_simple=1&action=process&json=1&page_size=30&lc=pt&fields=product_name,brands,image_front_small_url,image_url,nutriscore_grade,nutrition_grade_fr,nova_group,nutriments,categories_tags,quantity,ingredients_text`;
      const res2 = await fetchTimeout(url2);
      if (res2.ok) {
        const d2 = await res2.json();
        const lista2 = (d2.products || []).filter((p: Produto) => p.product_name && p.product_name.trim() !== '');
        if (lista2.length >= 1) return { produtos: lista2, erro: '' };
      }
    } catch {}
  }
  return { produtos: [], erro: 'Nenhum produto encontrado. Tente outro termo ou categoria.' };
}

export default function BuscaProdutos() {
  const { adicionarItem } = useShopping();
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [adicionados, setAdicionados] = useState<Record<string, boolean>>({});
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [catSel, setCatSel] = useState<string | null>(null);
  const [subSel, setSubSel] = useState<string | null>(null);
  const [toastV, setToastV] = useState(false);
  const [toastN, setToastN] = useState('');
  const [toastTipo, setToastTipo] = useState<'adicionado' | 'aumentado'>('adicionado');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarToast = (nome: string, tipo: 'adicionado' | 'aumentado') => {
    setToastN(nome); setToastTipo(tipo); setToastV(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastV(false), 3000);
  };

  const buscar = async (termos: string[]) => {
    setCarregando(true); setErro(''); setProdutos([]); setExpandidos({});
    const { produtos: found, erro: err } = await buscarComFallback(termos);
    setProdutos(found); setErro(err); setCarregando(false);
  };

  const catAtiva = CATEGORIAS.find(c => c.nome === catSel);
  const subAtiva = catAtiva?.subs.find(s => s.nome === subSel);

  const handleManual = () => {
    if (!busca.trim()) return;
    setCatSel(null); setSubSel(null);
    buscar([busca, busca + ' brasil', busca + ' brasileiro']);
  };

  const handleCat = (cat: Cat) => {
    if (catSel === cat.nome) { setCatSel(null); setSubSel(null); return; }
    setCatSel(cat.nome); setSubSel(null); setBusca('');
    buscar(cat.termos);
  };

  const handleSub = (sub: Sub) => {
    setSubSel(sub.nome); setBusca('');
    buscar(sub.termos);
  };

  const handleAdicionar = (produto: Produto) => {
    const resultado = adicionarItem({
      nome: produto.product_name, quantidade: 1, unidade: 'un', comprado: false,
      categoria: produto.categories_tags?.[0]?.replace('en:', '') || 'Alimento',
    });
    const id = produto.id || produto._id || produto.product_name;
    setAdicionados(p => ({ ...p, [id!]: true }));
    mostrarToast(produto.product_name, resultado);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.hd}>
          <Text style={s.tit}>🔍 Buscar Produtos</Text>
          <Text style={s.sub}>Open Food Facts · foco em produtos brasileiros</Text>
        </View>

        <View style={s.searchBox}>
          <TextInput style={s.input} placeholder="Ex: queijo mussarela, salmao, colgate..." placeholderTextColor="#9aada0" value={busca} onChangeText={t => { setBusca(t); setCatSel(null); setSubSel(null); }} onSubmitEditing={handleManual} returnKeyType="search" />
          <TouchableOpacity style={[s.btnB, carregando && s.btnOff]} onPress={handleManual} disabled={carregando} activeOpacity={0.85}>
            <Text style={s.btnBT}>{carregando ? '...' : 'Buscar'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.catLbl}>CATEGORIAS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll} style={{ marginBottom: 12 }}>
          {CATEGORIAS.map(cat => {
            const a = catSel === cat.nome;
            return <TouchableOpacity key={cat.nome} style={[s.catBtn, a && s.catA]} onPress={() => handleCat(cat)} activeOpacity={0.8}><Text style={s.catE}>{cat.emoji}</Text><Text style={[s.catN, a && s.catNA]}>{cat.nome}</Text></TouchableOpacity>;
          })}
        </ScrollView>

        {catAtiva && (
          <View style={s.subWrap}>
            <Text style={s.subLbl}>{catAtiva.emoji} Filtrar em {catAtiva.nome}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subScroll}>
              {catAtiva.subs.map(sub => {
                const a = subSel === sub.nome;
                return <TouchableOpacity key={sub.nome} style={[s.subBtn, a && s.subA]} onPress={() => handleSub(sub)} activeOpacity={0.8}><Text style={s.subE}>{sub.emoji}</Text><Text style={[s.subN, a && s.subNA]}>{sub.nome}</Text></TouchableOpacity>;
              })}
            </ScrollView>
          </View>
        )}

        {carregando && <View style={s.loading}><ActivityIndicator size="large" color="#2d6a4f" /><Text style={s.loadT}>{subSel || catSel ? `Buscando ${subSel || catSel}...` : 'Buscando...'}</Text><Text style={s.loadS}>Tentando multiplas fontes ☕</Text></View>}

        {erro !== '' && (
          <View style={s.erroBox}>
            <Text style={s.erroT}>🔍 Sem resultados</Text>
            <Text style={s.erroTxt}>{erro}</Text>
            <TouchableOpacity style={s.erroBtn} onPress={() => buscar(subAtiva?.termos || catAtiva?.termos || [busca])}>
              <Text style={s.erroBtnT}>🔄 Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {produtos.length > 0 && !carregando && (
          <View style={s.resHd}>
            {(subSel || catSel) && <View style={s.resBadge}><Text style={s.resBadgeTxt}>{subAtiva?.emoji || catAtiva?.emoji} {subSel || catSel}</Text></View>}
            <Text style={s.cont}>{produtos.length} produto{produtos.length !== 1 ? 's' : ''}</Text>
          </View>
        )}

        <View style={s.grid}>
          {produtos.map((produto, idx) => {
            const id = produto.id || produto._id || String(idx);
            const jaAdd = adicionados[id]; const exp = expandidos[id];
            const ns = produto.nutriscore_grade || produto.nutrition_grade_fr;
            const nsCor = ns ? NS_COR[ns.toLowerCase()] : null;
            const nova = produto.nova_group ? NOVA[produto.nova_group] : null;
            const n = produto.nutriments;
            const kcal = n?.['energy-kcal_100g'] || n?.['energy-kcal'];
            const prot = n?.proteins_100g, carbs = n?.carbohydrates_100g;
            const gord = n?.fat_100g, fibra = n?.fiber_100g;
            const acucar = n?.sugars_100g;
            const sodio = n?.sodium_100g ?? (n?.salt_100g ? n.salt_100g / 2.5 : undefined);
            const temN = kcal !== undefined || prot !== undefined || carbs !== undefined || gord !== undefined;

            return (
              <View key={id} style={s.card}>
                <View style={s.cardTopo}>
                  {produto.image_front_small_url || produto.image_url
                    ? <Image source={{ uri: produto.image_front_small_url || produto.image_url }} style={s.img} resizeMode="contain" />
                    : <View style={s.imgPh}><Text style={{ fontSize: 52 }}>🥫</Text></View>}
                  {ns && nsCor && <View style={[s.nsBadge, { backgroundColor: nsCor }]}><Text style={s.nsL}>{ns.toUpperCase()}</Text><Text style={s.nsLbl}>Nutri{'\n'}Score</Text></View>}
                </View>
                <View style={s.cardBody}>
                  <Text style={s.pNome} numberOfLines={2}>{produto.product_name}</Text>
                  <View style={s.pMeta}>
                    {produto.brands && <Text style={s.pMarca}>🏷️ {produto.brands.split(',')[0]}</Text>}
                    {produto.quantity && <Text style={s.pQty}>📦 {produto.quantity}</Text>}
                  </View>
                  <View style={s.tags}>
                    {kcal !== undefined && <View style={[s.tag, { backgroundColor: '#fde8e4' }]}><Text style={[s.tagT, { color: '#e76f51' }]}>🔥 {Math.round(kcal)} kcal</Text></View>}
                    {nova && <View style={[s.tag, { backgroundColor: nova.cor + '18' }]}><Text style={[s.tagT, { color: nova.cor }]}>{nova.emoji} {nova.label}</Text></View>}
                  </View>
                  {temN && <TouchableOpacity style={s.btnExp} onPress={() => setExpandidos(p => ({ ...p, [id]: !p[id] }))} activeOpacity={0.8}><Text style={s.btnExpT}>{exp ? '▲ Ocultar nutrientes' : '▼ Ver tabela nutricional'}</Text></TouchableOpacity>}
                  {exp && (
                    <View style={s.tabela}>
                      <Text style={s.tabT}>📊 Por 100g / 100ml</Text>
                      <NutriRow emoji="🔥" label="Calorias" valor={kcal !== undefined ? `${Math.round(kcal)} kcal` : null} dest />
                      <NutriRow emoji="🥩" label="Proteinas" valor={fmt(prot) ? `${fmt(prot)}g` : null} />
                      <NutriRow emoji="🍞" label="Carboidratos" valor={fmt(carbs) ? `${fmt(carbs)}g` : null} />
                      <NutriRow emoji="🍬" label="Acucares" valor={fmt(acucar) ? `${fmt(acucar)}g` : null} />
                      <NutriRow emoji="🧈" label="Gorduras" valor={fmt(gord) ? `${fmt(gord)}g` : null} />
                      <NutriRow emoji="🌾" label="Fibras" valor={fmt(fibra) ? `${fmt(fibra)}g` : null} />
                      <NutriRow emoji="🧂" label="Sodio" valor={sodio !== undefined ? `${fmt(sodio, 2)}g` : null} />
                      {nova && <View style={[s.novaBadge, { backgroundColor: nova.cor + '15', borderColor: nova.cor + '40' }]}><Text style={[s.novaTxt, { color: nova.cor }]}>{nova.emoji} Grau NOVA {produto.nova_group} - {nova.label}</Text></View>}
                      {produto.ingredients_text && <View style={s.ing}><Text style={s.ingT}>🧪 Ingredientes</Text><Text style={s.ingTxt} numberOfLines={5}>{produto.ingredients_text}</Text></View>}
                    </View>
                  )}
                  <TouchableOpacity style={[s.btnAdd, jaAdd && s.btnAdded]} onPress={() => handleAdicionar(produto)} disabled={jaAdd} activeOpacity={0.85}>
                    <Text style={[s.btnAddT, jaAdd && s.btnAddedT]}>{jaAdd ? '✓ Adicionado' : '+ Adicionar a lista'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {!carregando && produtos.length === 0 && erro === '' && (
          <View style={s.empty}><Text style={{ fontSize: 56 }}>🥦</Text><Text style={s.emptyT}>Descubra produtos</Text><Text style={s.emptyS}>Digite um alimento ou escolha{'\n'}uma categoria acima</Text></View>
        )}
      </ScrollView>
      <Toast visible={toastV} nome={toastN} tipo={toastTipo} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fefae0' },
  container: { padding: 20, paddingTop: 40, paddingBottom: 100 },
  hd: { marginBottom: 16 },
  tit: { fontSize: 24, fontWeight: '900', color: '#2d6a4f', marginBottom: 4 },
  sub: { fontSize: 13, color: '#7a9080' },
  searchBox: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { flex: 1, borderWidth: 2, borderColor: '#b7e4c7', borderRadius: 14, padding: 13, fontSize: 15, color: '#3d2b1f', backgroundColor: '#fff' },
  btnB: { backgroundColor: '#2d6a4f', borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' },
  btnOff: { opacity: 0.6 },
  btnBT: { color: '#fff', fontWeight: '700', fontSize: 15 },
  catLbl: { fontSize: 11, fontWeight: '700', color: '#9aada0', letterSpacing: 1, marginBottom: 10 },
  catScroll: { gap: 8, paddingRight: 8 },
  catBtn: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 2, borderColor: '#e8f5ee', minWidth: 74, elevation: 2 },
  catA: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  catE: { fontSize: 22, marginBottom: 4 },
  catN: { fontSize: 11, fontWeight: '600', color: '#5a7a65' },
  catNA: { color: '#fff' },
  subWrap: { backgroundColor: '#f0faf4', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#b7e4c7' },
  subLbl: { fontSize: 12, fontWeight: '700', color: '#2d6a4f', marginBottom: 10 },
  subScroll: { gap: 8 },
  subBtn: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1.5, borderColor: '#b7e4c7', minWidth: 64 },
  subA: { backgroundColor: '#52b788', borderColor: '#52b788' },
  subE: { fontSize: 18, marginBottom: 3 },
  subN: { fontSize: 11, fontWeight: '600', color: '#2d6a4f' },
  subNA: { color: '#fff' },
  loading: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  loadT: { color: '#3d2b1f', fontSize: 15, fontWeight: '600' },
  loadS: { color: '#9aada0', fontSize: 12 },
  erroBox: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center', gap: 8 },
  erroT: { fontSize: 16, fontWeight: '800', color: '#3d2b1f' },
  erroTxt: { fontSize: 13, color: '#7a9080', textAlign: 'center', lineHeight: 20 },
  erroBtn: { backgroundColor: '#2d6a4f', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  erroBtnT: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resHd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 },
  resBadge: { backgroundColor: '#2d6a4f', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  resBadgeTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cont: { color: '#7a9080', fontSize: 13 },
  grid: { gap: 18 },
  card: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  cardTopo: { position: 'relative', backgroundColor: '#f4f1eb' },
  img: { width: '100%', height: 180 },
  imgPh: { width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' },
  nsBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 12, padding: 8, alignItems: 'center', minWidth: 48 },
  nsL: { color: '#fff', fontWeight: '900', fontSize: 20, lineHeight: 22 },
  nsLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', textAlign: 'center', lineHeight: 11 },
  cardBody: { padding: 16, gap: 8 },
  pNome: { fontSize: 17, fontWeight: '900', color: '#3d2b1f', lineHeight: 23 },
  pMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pMarca: { fontSize: 12, color: '#9aada0' },
  pQty: { fontSize: 12, color: '#9aada0' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  tagT: { fontSize: 11, fontWeight: '700' },
  btnExp: { backgroundColor: '#f0faf4', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#b7e4c7' },
  btnExpT: { color: '#2d6a4f', fontWeight: '700', fontSize: 13 },
  tabela: { backgroundColor: '#fafdf9', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#d8f3dc', gap: 2 },
  tabT: { fontSize: 13, fontWeight: '800', color: '#2d6a4f', marginBottom: 8 },
  novaBadge: { borderRadius: 10, padding: 10, borderWidth: 1, marginTop: 8, alignItems: 'center' },
  novaTxt: { fontSize: 12, fontWeight: '700' },
  ing: { backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e8f5ee', marginTop: 4 },
  ingT: { fontSize: 12, fontWeight: '800', color: '#3d2b1f', marginBottom: 6 },
  ingTxt: { fontSize: 11, color: '#7a9080', lineHeight: 17 },
  btnAdd: { backgroundColor: '#2d6a4f', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnAdded: { backgroundColor: '#f4f1eb', borderWidth: 2, borderColor: '#b7e4c7' },
  btnAddT: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnAddedT: { color: '#52b788' },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyT: { fontSize: 20, fontWeight: '900', color: '#3d2b1f' },
  emptyS: { fontSize: 14, color: '#9aada0', textAlign: 'center', lineHeight: 22 },
});