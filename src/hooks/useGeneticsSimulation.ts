import { useState, useCallback, useMemo } from 'react';

export interface Allele {
  symbol: string;
  name: string;
  nameAr: string;
  isDominant: boolean;
  phenotype: string;
  phenotypeAr: string;
}

export interface Trait {
  id: string;
  name: string;
  nameAr: string;
  alleles: [Allele, Allele]; // [Dominant, Recessive]
  description: string;
}

export interface Parent {
  genotype: [string, string];
  phenotype: string;
}

export interface PunnettResult {
  genotype: string;
  phenotype: string;
  probability: number;
  count: number;
}

export interface DNABase {
  symbol: 'A' | 'T' | 'G' | 'C';
  name: string;
  nameAr: string;
  complement: 'A' | 'T' | 'G' | 'C';
  color: string;
}

export interface MutationType {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  effect: 'harmful' | 'neutral' | 'beneficial';
}

export interface GeneticsState {
  // Punnett Square
  selectedTrait: string;
  parent1: Parent;
  parent2: Parent;
  punnettResults: PunnettResult[];
  
  // DNA
  dnaSequence: DNABase[];
  complementaryStrand: DNABase[];
  isReplicating: boolean;
  replicationStep: number;
  
  // Mutations
  originalSequence: DNABase[];
  mutatedSequence: DNABase[];
  mutationType: string | null;
  mutationPosition: number;
}

// Predefined traits for Punnett Square
export const TRAITS: Trait[] = [
  {
    id: 'eye-color',
    name: 'Eye Color',
    nameAr: 'لون العيون',
    alleles: [
      { symbol: 'B', name: 'Brown', nameAr: 'بني', isDominant: true, phenotype: 'Brown eyes', phenotypeAr: 'عيون بنية' },
      { symbol: 'b', name: 'Blue', nameAr: 'أزرق', isDominant: false, phenotype: 'Blue eyes', phenotypeAr: 'عيون زرقاء' }
    ],
    description: 'اللون البني سائد على اللون الأزرق'
  },
  {
    id: 'hair-color',
    name: 'Hair Color',
    nameAr: 'لون الشعر',
    alleles: [
      { symbol: 'D', name: 'Dark', nameAr: 'داكن', isDominant: true, phenotype: 'Dark hair', phenotypeAr: 'شعر داكن' },
      { symbol: 'd', name: 'Light', nameAr: 'فاتح', isDominant: false, phenotype: 'Light hair', phenotypeAr: 'شعر فاتح' }
    ],
    description: 'الشعر الداكن سائد على الشعر الفاتح'
  },
  {
    id: 'blood-type',
    name: 'Blood Type (simplified)',
    nameAr: 'فصيلة الدم (مبسط)',
    alleles: [
      { symbol: 'A', name: 'Type A', nameAr: 'فصيلة A', isDominant: true, phenotype: 'Type A blood', phenotypeAr: 'فصيلة دم A' },
      { symbol: 'O', name: 'Type O', nameAr: 'فصيلة O', isDominant: false, phenotype: 'Type O blood', phenotypeAr: 'فصيلة دم O' }
    ],
    description: 'فصيلة A سائدة على فصيلة O'
  },
  {
    id: 'tongue-roll',
    name: 'Tongue Rolling',
    nameAr: 'لف اللسان',
    alleles: [
      { symbol: 'R', name: 'Roller', nameAr: 'قادر', isDominant: true, phenotype: 'Can roll tongue', phenotypeAr: 'قادر على لف اللسان' },
      { symbol: 'r', name: 'Non-roller', nameAr: 'غير قادر', isDominant: false, phenotype: 'Cannot roll tongue', phenotypeAr: 'غير قادر على لف اللسان' }
    ],
    description: 'القدرة على لف اللسان صفة سائدة'
  },
  {
    id: 'dimples',
    name: 'Dimples',
    nameAr: 'الغمازات',
    alleles: [
      { symbol: 'D', name: 'Dimples', nameAr: 'غمازات', isDominant: true, phenotype: 'Has dimples', phenotypeAr: 'لديه غمازات' },
      { symbol: 'd', name: 'No Dimples', nameAr: 'بدون غمازات', isDominant: false, phenotype: 'No dimples', phenotypeAr: 'بدون غمازات' }
    ],
    description: 'وجود الغمازات صفة سائدة'
  }
];

// DNA Bases
export const DNA_BASES: Record<string, DNABase> = {
  A: { symbol: 'A', name: 'Adenine', nameAr: 'أدينين', complement: 'T', color: '#FF6B6B' },
  T: { symbol: 'T', name: 'Thymine', nameAr: 'ثايمين', complement: 'A', color: '#4ECDC4' },
  G: { symbol: 'G', name: 'Guanine', nameAr: 'جوانين', complement: 'C', color: '#45B7D1' },
  C: { symbol: 'C', name: 'Cytosine', nameAr: 'سايتوزين', complement: 'G', color: '#96CEB4' }
};

// Mutation types
export const MUTATION_TYPES: MutationType[] = [
  { id: 'substitution', name: 'Substitution', nameAr: 'استبدال', description: 'استبدال قاعدة بأخرى', effect: 'neutral' },
  { id: 'insertion', name: 'Insertion', nameAr: 'إضافة', description: 'إضافة قاعدة جديدة', effect: 'harmful' },
  { id: 'deletion', name: 'Deletion', nameAr: 'حذف', description: 'حذف قاعدة من التسلسل', effect: 'harmful' },
  { id: 'silent', name: 'Silent', nameAr: 'صامتة', description: 'لا تغير البروتين الناتج', effect: 'neutral' },
  { id: 'beneficial', name: 'Beneficial', nameAr: 'مفيدة', description: 'تحسن من وظيفة البروتين', effect: 'beneficial' }
];

// Generate random DNA sequence
const generateDNASequence = (length: number): DNABase[] => {
  const bases: DNABase['symbol'][] = ['A', 'T', 'G', 'C'];
  return Array.from({ length }, () => DNA_BASES[bases[Math.floor(Math.random() * 4)]]);
};

// Get complementary strand
const getComplementaryStrand = (sequence: DNABase[]): DNABase[] => {
  return sequence.map(base => DNA_BASES[base.complement]);
};

export const useGeneticsSimulation = () => {
  const [state, setState] = useState<GeneticsState>(() => {
    const initialSequence = generateDNASequence(20);
    return {
      selectedTrait: 'eye-color',
      parent1: { genotype: ['B', 'b'], phenotype: 'Brown eyes' },
      parent2: { genotype: ['B', 'b'], phenotype: 'Brown eyes' },
      punnettResults: [],
      dnaSequence: initialSequence,
      complementaryStrand: getComplementaryStrand(initialSequence),
      isReplicating: false,
      replicationStep: 0,
      originalSequence: [...initialSequence],
      mutatedSequence: [...initialSequence],
      mutationType: null,
      mutationPosition: -1
    };
  });

  // ============ PUNNETT SQUARE ============

  // Calculate Punnett Square results
  const calculatePunnettSquare = useCallback(() => {
    const { parent1, parent2 } = state;
    const trait = TRAITS.find(t => t.id === state.selectedTrait);
    if (!trait) return;

    const results: Map<string, PunnettResult> = new Map();
    const combinations: string[] = [];

    // Generate all possible combinations
    for (const allele1 of parent1.genotype) {
      for (const allele2 of parent2.genotype) {
        // Sort to ensure consistent genotype representation (e.g., Bb not bB)
        const genotype = [allele1, allele2].sort((a, b) => {
          if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
          if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
          return a.localeCompare(b);
        }).join('');
        
        combinations.push(genotype);
        
        // Determine phenotype
        const isDominant = genotype.includes(trait.alleles[0].symbol);
        const phenotype = isDominant ? trait.alleles[0].phenotypeAr : trait.alleles[1].phenotypeAr;
        
        if (results.has(genotype)) {
          const existing = results.get(genotype)!;
          existing.count++;
        } else {
          results.set(genotype, {
            genotype,
            phenotype,
            probability: 0,
            count: 1
          });
        }
      }
    }

    // Calculate probabilities
    const totalCombinations = combinations.length;
    results.forEach(result => {
      result.probability = (result.count / totalCombinations) * 100;
    });

    setState(prev => ({
      ...prev,
      punnettResults: Array.from(results.values())
    }));
  }, [state.selectedTrait, state.parent1, state.parent2]);

  const setSelectedTrait = useCallback((traitId: string) => {
    const trait = TRAITS.find(t => t.id === traitId);
    if (trait) {
      const dominant = trait.alleles[0].symbol;
      const recessive = trait.alleles[1].symbol;
      setState(prev => ({
        ...prev,
        selectedTrait: traitId,
        parent1: { 
          genotype: [dominant, recessive], 
          phenotype: trait.alleles[0].phenotypeAr 
        },
        parent2: { 
          genotype: [dominant, recessive], 
          phenotype: trait.alleles[0].phenotypeAr 
        },
        punnettResults: []
      }));
    }
  }, []);

  const setParentGenotype = useCallback((parent: 1 | 2, genotype: [string, string]) => {
    const trait = TRAITS.find(t => t.id === state.selectedTrait);
    if (!trait) return;

    const isDominant = genotype.some(g => g === trait.alleles[0].symbol);
    const phenotype = isDominant ? trait.alleles[0].phenotypeAr : trait.alleles[1].phenotypeAr;

    setState(prev => ({
      ...prev,
      [`parent${parent}`]: { genotype, phenotype }
    }));
  }, [state.selectedTrait]);

  // ============ DNA REPLICATION ============

  const generateNewDNASequence = useCallback((length: number = 20) => {
    const newSequence = generateDNASequence(length);
    setState(prev => ({
      ...prev,
      dnaSequence: newSequence,
      complementaryStrand: getComplementaryStrand(newSequence),
      originalSequence: [...newSequence],
      mutatedSequence: [...newSequence],
      isReplicating: false,
      replicationStep: 0,
      mutationType: null,
      mutationPosition: -1
    }));
  }, []);

  const startReplication = useCallback(() => {
    setState(prev => ({
      ...prev,
      isReplicating: true,
      replicationStep: 0
    }));
  }, []);

  const advanceReplication = useCallback(() => {
    setState(prev => {
      if (!prev.isReplicating) return prev;
      
      const nextStep = prev.replicationStep + 1;
      if (nextStep >= prev.dnaSequence.length * 2) {
        return { ...prev, isReplicating: false, replicationStep: 0 };
      }
      
      return { ...prev, replicationStep: nextStep };
    });
  }, []);

  const stopReplication = useCallback(() => {
    setState(prev => ({ ...prev, isReplicating: false }));
  }, []);

  const resetReplication = useCallback(() => {
    setState(prev => ({
      ...prev,
      isReplicating: false,
      replicationStep: 0
    }));
  }, []);

  // ============ MUTATIONS ============

  const applyMutation = useCallback((type: string, position?: number) => {
    setState(prev => {
      const pos = position ?? Math.floor(Math.random() * prev.originalSequence.length);
      const newSequence = [...prev.originalSequence];
      const bases: DNABase['symbol'][] = ['A', 'T', 'G', 'C'];

      switch (type) {
        case 'substitution': {
          // Replace with a different base
          const currentBase = newSequence[pos].symbol;
          const otherBases = bases.filter(b => b !== currentBase);
          const newBase = otherBases[Math.floor(Math.random() * otherBases.length)];
          newSequence[pos] = DNA_BASES[newBase];
          break;
        }
        case 'insertion': {
          // Insert a new base
          const newBase = bases[Math.floor(Math.random() * bases.length)];
          newSequence.splice(pos, 0, DNA_BASES[newBase]);
          break;
        }
        case 'deletion': {
          // Delete a base
          newSequence.splice(pos, 1);
          break;
        }
        case 'silent':
        case 'beneficial': {
          // For demonstration, just substitute but mark differently
          const currentBase = newSequence[pos].symbol;
          const otherBases = bases.filter(b => b !== currentBase);
          const newBase = otherBases[Math.floor(Math.random() * otherBases.length)];
          newSequence[pos] = DNA_BASES[newBase];
          break;
        }
      }

      return {
        ...prev,
        mutatedSequence: newSequence,
        mutationType: type,
        mutationPosition: pos
      };
    });
  }, []);

  const resetMutation = useCallback(() => {
    setState(prev => ({
      ...prev,
      mutatedSequence: [...prev.originalSequence],
      mutationType: null,
      mutationPosition: -1
    }));
  }, []);

  // ============ COMPUTED VALUES ============

  const currentTrait = useMemo(() => {
    return TRAITS.find(t => t.id === state.selectedTrait);
  }, [state.selectedTrait]);

  const phenotypeRatios = useMemo(() => {
    const phenotypes: Map<string, number> = new Map();
    
    state.punnettResults.forEach(result => {
      const current = phenotypes.get(result.phenotype) || 0;
      phenotypes.set(result.phenotype, current + result.count);
    });

    return Array.from(phenotypes.entries()).map(([phenotype, count]) => ({
      phenotype,
      count,
      ratio: count
    }));
  }, [state.punnettResults]);

  const genotypeRatios = useMemo(() => {
    return state.punnettResults.map(result => ({
      genotype: result.genotype,
      count: result.count,
      ratio: result.count
    }));
  }, [state.punnettResults]);

  const dnaSequenceString = useMemo(() => {
    return state.dnaSequence.map(b => b.symbol).join('');
  }, [state.dnaSequence]);

  const complementaryString = useMemo(() => {
    return state.complementaryStrand.map(b => b.symbol).join('');
  }, [state.complementaryStrand]);

  const mutationComparison = useMemo(() => {
    const original = state.originalSequence.map(b => b.symbol).join('');
    const mutated = state.mutatedSequence.map(b => b.symbol).join('');
    const differences: number[] = [];
    
    const maxLength = Math.max(original.length, mutated.length);
    for (let i = 0; i < maxLength; i++) {
      if (original[i] !== mutated[i]) {
        differences.push(i);
      }
    }
    
    return {
      original,
      mutated,
      differences,
      lengthChange: mutated.length - original.length
    };
  }, [state.originalSequence, state.mutatedSequence]);

  return {
    state,
    currentTrait,
    phenotypeRatios,
    genotypeRatios,
    dnaSequenceString,
    complementaryString,
    mutationComparison,
    // Punnett Square
    setSelectedTrait,
    setParentGenotype,
    calculatePunnettSquare,
    // DNA
    generateNewDNASequence,
    startReplication,
    advanceReplication,
    stopReplication,
    resetReplication,
    // Mutations
    applyMutation,
    resetMutation,
    // Constants
    TRAITS,
    DNA_BASES,
    MUTATION_TYPES
  };
};
