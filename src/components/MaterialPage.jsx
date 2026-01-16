import { BookOpen, CheckCircle, Clock } from 'lucide-react';

const MaterialPage = () => {
    const subjects = [
        "Língua Portuguesa",
        "Raciocínio Lógico-Matemático (RLM)",
        "Informática",
        "Física",
        "Ética no Serviço Público",
        "Geopolítica Brasileira",
        "História da PRF",
        "Língua Estrangeira (Inglês/Espanhol)",
        "Legislação de Trânsito (CTB e Resoluções)",
        "Direito Administrativo",
        "Direito Constitucional",
        "Direito Penal",
        "Direito Processual Penal",
        "Legislação Especial",
        "Direitos Humanos"
    ];

    // Generate 12 empty simulation slots
    const simulations = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        status: 'pending', // pending, completed
        score: ''
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Material de Estudo</h2>
                <p className="text-gray-500 text-sm">Gerencie seu ciclo de estudos e simulados para a PRF.</p>
            </div>

            {/* Section 1: Sala de Aula (Ciclo de Estudos) */}
            <section>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50/20">
                        <div className="flex items-center gap-2 text-blue-800">
                            <BookOpen size={20} />
                            <h3 className="font-bold text-lg">Sala de Aula - Ciclo PRF</h3>
                        </div>
                        <p className="text-sm text-blue-600/80 mt-1">
                            Grade de disciplinas oficial para o concurso da Polícia Rodoviária Federal.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subjects.map((subject, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-900">
                                        {subject}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Área de Simulados */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-yellow-400 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-800">Área de Simulados - Rumo à PRF</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {simulations.map((sim) => (
                        <div key={sim.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">

                            {/* Card Header visual strip */}
                            <div className="h-2 w-full bg-gray-100 group-hover:bg-yellow-400 transition-colors"></div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-gray-900 text-lg">Simulado {sim.id.toString().padStart(2, '0')}</h4>
                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                        <Clock size={10} />
                                        Pendente
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                            Pontuação Líquida
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="--"
                                                disabled
                                                className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                                            />
                                            <span className="text-xs text-gray-400">/ 120 pts</span>
                                        </div>
                                    </div>

                                    <button
                                        disabled
                                        className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        Iniciar Simulado
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MaterialPage;
