import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Copy, BookOpen, CalendarDays, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface Jurisprudencia {
  tribunal: string;
  numero: string;
  data: string;
  ementa: string;
  relator: string;
  orgao: string;
  texto: string;
}

const MOCK_JURIS: Jurisprudencia[] = [
  {
    tribunal: "TJEX",
    numero: "0000001-00.2024.8.99.0001",
    data: "10/06/2024",
    ementa:
      "RECURSO INOMINADO. CONSUMIDOR. GOLPE DIGITAL. TRANSFERÊNCIA VIA PIX. RESPONSABILIDADE DO BANCO. AUSÊNCIA DE DILIGÊNCIA. DANO MATERIAL CONFIGURADO. SENTENÇA MANTIDA.",
    relator: "Des. Fictício Silva",
    orgao: "2ª Turma Recursal",
    texto: `Vistos, relatados e discutidos estes autos. Trata-se de ação em que o consumidor alega ter sido vítima de golpe digital, com transferência via PIX para conta de terceiro fraudador. O banco réu não demonstrou ter adotado medidas eficazes de segurança. Diante da ausência de diligência, reconhece-se a responsabilidade objetiva da instituição financeira. Recurso conhecido e não provido.`,
  },
  {
    tribunal: "TJEX",
    numero: "0000002-00.2024.8.99.0001",
    data: "05/06/2024",
    ementa:
      "DIREITO CIVIL. FRAUDE EM TRANSAÇÃO ELETRÔNICA. PIX. INSTITUIÇÃO FINANCEIRA. FALHA NA SEGURANÇA. DEVER DE INDENIZAR. RECURSO PROVIDO.",
    relator: "Des. Maria Fictícia",
    orgao: "1ª Câmara Cível",
    texto: `O autor comprovou que não realizou a transação contestada. A instituição financeira não logrou êxito em demonstrar a regularidade da operação. Configurada a falha na prestação do serviço, impõe-se o dever de indenizar. Recurso provido para condenar o banco ao ressarcimento do valor subtraído.`,
  },
  {
    tribunal: "TJEX",
    numero: "0000003-00.2024.8.99.0001",
    data: "01/06/2024",
    ementa:
      "RESPONSABILIDADE CIVIL. GOLPE DO PIX. CONSUMIDOR. BANCO. OMISSÃO NA PREVENÇÃO DE FRAUDES. DANO MORAL RECONHECIDO.",
    relator: "Des. João Teste",
    orgao: "3ª Vara Cível",
    texto: `A omissão do banco na prevenção de fraudes eletrônicas caracteriza falha na prestação do serviço. O consumidor faz jus à indenização por danos morais, além da restituição dos valores subtraídos. Sentença mantida por seus próprios fundamentos.`
  },
];

const TRIBUNAIS = [
  "STF", "STJ", "TST", "TSE", "TJAC", "TJAL", "TJAM", "TJAP", "TJBA", "TJCE", "TJDFT", "TJES", "TJMA", "TJMG", "TJMT", "TJPA", "TJPB", "TJPE", "TJPI", "TJPR", "TJRJ", "TJRN", "TJRO", "TJRR", "TJRS", "TJSC", "TJSE", "TJSP", "TJTO"
];
const AREAS = ["Cível", "Criminal", "Trabalhista", "Previdenciário", "Administrativo", "Tributário"];

export default function Jurisprudencias() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Jurisprudencia[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Filtros avançados
  const [tribunal, setTribunal] = useState("");
  const [area, setArea] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults(
        MOCK_JURIS.filter(j => {
          const matchQuery =
            j.ementa.toLowerCase().includes(query.toLowerCase()) ||
            j.numero.includes(query) ||
            j.tribunal.toLowerCase().includes(query.toLowerCase());
          const matchTribunal = tribunal && tribunal !== "all" ? j.tribunal === tribunal : true;
          const matchArea = area && area !== "all" ? j.ementa.toLowerCase().includes(area.toLowerCase()) : true;
          const matchNumero = numeroProcesso ? j.numero.includes(numeroProcesso) : true;
          // Datas mockadas, não filtra por data
          return matchQuery && matchTribunal && matchArea && matchNumero;
        })
      );
      setLoading(false);
    }, 700);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Jurisprudências"
        subtitle="Pesquise jurisprudências relevantes para seu caso. Em breve, busca avançada e filtros inteligentes."
        icon={<BookOpen className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold" disabled>
            <Plus className="w-4 h-4 mr-2" /> Nova Jurisprudência
          </Button>
        }
      />
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <Card className="mb-6 shadow-lg border border-gray-100 bg-white px-2 md:px-8 py-6">
            <form onSubmit={handleSearch} className="">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-end">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </span>
                  <Input
                    placeholder="Buscar por termo, número, tribunal..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-10 h-12 text-base shadow-sm border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 focus:outline-none focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all"
                  />
                </div>
                <div className="flex-none w-full md:w-auto flex gap-2 mt-2 md:mt-0 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowFilters((v) => !v)}
                  >
                    <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200"
                    disabled={loading || !query.trim()}
                  >
                    Buscar
                  </Button>
                </div>
              </div>
              {showFilters && (
                <div className="w-full bg-gray-50 border border-gray-100 rounded-lg shadow-inner mt-4 p-4 flex flex-wrap gap-4 animate-in fade-in">
                  <div className="flex-1 min-w-[160px] relative">
                    <Select value={tribunal} onValueChange={setTribunal}>
                      <SelectTrigger className="w-full h-12 text-base border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all">
                        <SelectValue placeholder="Tribunal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {TRIBUNAIS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[160px] relative">
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger className="w-full h-12 text-base border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all">
                        <SelectValue placeholder="Área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {AREAS.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[160px] relative">
                    <div className="relative">
                      <Input
                        placeholder=" "
                        value={numeroProcesso}
                        onChange={e => setNumeroProcesso(e.target.value)}
                        className="h-12 text-base border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all peer"
                      />
                      <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600 bg-white px-1">
                        Nº do Processo
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[160px] relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder=" "
                            value={dataInicial ? format(dataInicial, "dd/MM/yyyy") : ""}
                            readOnly
                            className="h-12 text-base border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all peer"
                          />
                          <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600 bg-white px-1">
                            Data Inicial
                          </label>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar mode="single" selected={dataInicial} onSelect={setDataInicial} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 min-w-[160px] relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder=" "
                            value={dataFinal ? format(dataFinal, "dd/MM/yyyy") : ""}
                            readOnly
                            className="h-12 text-base border border-gray-200 focus:border-0 focus:ring-2 focus:ring-blue-400 focus:bg-gradient-to-r focus:from-blue-100 focus:to-green-100 transition-all peer"
                          />
                          <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600 bg-white px-1">
                            Data Final
                          </label>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar mode="single" selected={dataFinal} onSelect={setDataFinal} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
                    <Button
                      type="submit"
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              )}
            </form>
            {loading && <div className="text-center text-gray-500 py-4">Buscando jurisprudências...</div>}
            {results && (
              <div className="pt-2 flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-4 w-full">Mostrando {results.length} resultado(s)</div>
                <div className="w-full max-w-3xl space-y-8">
                  {results.length === 0 && (
                    <div className="text-center text-gray-400">Nenhuma jurisprudência encontrada.</div>
                  )}
                  {results.map((j, idx) => (
                    <div key={j.numero} className="rounded-2xl shadow-lg bg-white/90 border border-gray-100 p-0 overflow-hidden">
                      {/* Topo: Tribunal, número, data */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-6 pt-5 pb-2 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-green-50/40">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-blue-700 font-bold text-sm"><BookOpen className="w-5 h-5" /> {j.tribunal}</span>
                          <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-700">{j.numero}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><CalendarDays className="w-4 h-4" /> {j.data}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Relator: <span className="font-medium text-gray-700">{j.relator}</span></span>
                          <span>Órgão: <span className="font-medium text-gray-700">{j.orgao}</span></span>
                        </div>
                      </div>
                      {/* Ementa em destaque */}
                      <div className="flex items-start gap-3 px-6 py-4 bg-gradient-to-r from-blue-100/60 to-green-100/40 border-b border-gray-100">
                        <span className="text-blue-400 mt-1"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7 17V7a5 5 0 0 1 5-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 7v10a5 5 0 0 1-5 5H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <div className="flex-1 text-gray-800 text-base leading-relaxed">
                          <span className="font-semibold text-blue-700">Ementa:</span> {j.ementa}
                        </div>
                      </div>
                      {/* Botões de ação */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-3 bg-white">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => {
                          const textoCompleto = expanded === j.numero ? `${j.ementa}\n\n${j.texto}` : j.ementa;
                          navigator.clipboard.writeText(textoCompleto);
                        }}>
                          <Copy className="w-4 h-4" /> Copiar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setExpanded(expanded === j.numero ? null : j.numero)}>
                          {expanded === j.numero ? "Ocultar texto completo" : "Ver texto completo"}
                        </Button>
                      </div>
                      {/* Texto completo colapsável */}
                      {expanded === j.numero && (
                        <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100 animate-in fade-in">
                          <div className="rounded-lg p-4 bg-white border border-gray-100 text-gray-700 text-sm leading-relaxed shadow-inner">
                            <span className="font-semibold text-blue-700">Texto completo:</span> {j.texto}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 