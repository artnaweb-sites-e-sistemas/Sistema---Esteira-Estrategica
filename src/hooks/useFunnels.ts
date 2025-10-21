import { useState, useEffect } from 'react';
import { Funnel, Product, Step } from '../types';
import { defaultProducts } from '../data/defaultProducts';
import { useAuth } from './useAuth';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper function to recursively convert undefined values to null
const sanitizeObjectForFirestore = (obj: any): any => {
  if (obj === undefined) {
    return null;
  }
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectForFirestore(item));
  }
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = sanitizeObjectForFirestore(obj[key]);
    }
  }
  return newObj;
};

// Helper function to clean orphan parentId references
const cleanOrphanReferences = async (funnels: Funnel[]): Promise<Funnel[]> => {
  let hasChanges = false;
  
  const cleanedFunnels = funnels.map(funnel => {
    const cleanedProducts = funnel.products.map(product => {
      // Criar um Set de IDs de todas as etapas existentes
      const existingStepIds = new Set(product.steps.map(s => s.id));
      
      // Limpar parentId de etapas que apontam para pais inexistentes
      const cleanedSteps = product.steps.map(step => {
        if (step.parentId && !existingStepIds.has(step.parentId)) {
          console.log(`🧹 Limpando parentId órfão: etapa ${step.id} apontava para ${step.parentId} que não existe mais`);
          hasChanges = true;
          const { parentId, ...stepWithoutParent } = step;
          return stepWithoutParent;
        }
        return step;
      });
      
      return { ...product, steps: cleanedSteps };
    });
    
    return { ...funnel, products: cleanedProducts };
  });
  
  // Se houve mudanças, salvar no Firestore
  if (hasChanges) {
    console.log('🧹 Referências órfãs detectadas! Salvando funis limpos no Firestore...');
    
    for (const funnel of cleanedFunnels) {
      try {
        const funnelRef = doc(db, 'funnels', funnel.id);
        const dataToUpdate = sanitizeObjectForFirestore({
          ...funnel,
          updatedAt: serverTimestamp()
        });
        delete dataToUpdate.id;
        await updateDoc(funnelRef, dataToUpdate);
        console.log(`✅ Funil ${funnel.name} limpo e salvo no Firestore`);
      } catch (error) {
        console.error(`❌ Erro ao salvar funil limpo ${funnel.name}:`, error);
      }
    }
  } else {
    console.log('✅ Nenhuma referência órfã encontrada');
  }
  
  return cleanedFunnels;
};

export const useFunnels = () => {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar funis do Firestore quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadFunnels();
    } else {
      // Limpar dados quando não há usuário
      setFunnels([]);
      setActiveFunnelId(null);
    }
  }, [user]);

  const loadFunnels = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Carregando funis do usuário:', user.id);
      
      const funnelsRef = collection(db, 'funnels');
      const q = query(
        funnelsRef, 
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedFunnels: Funnel[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Converter Timestamps do Firestore para strings
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString();
          
        const updatedAt = data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString();
        
        loadedFunnels.push({
          id: doc.id,
          ...data,
          createdAt,
          updatedAt
        } as Funnel);
      });
      
      console.log('✅ Funis carregados do Firestore:', loadedFunnels.length);
      
      // 🧹 Limpar referências órfãs de parentId
      const cleanedFunnels = await cleanOrphanReferences(loadedFunnels);
      setFunnels(cleanedFunnels);
      
      if (loadedFunnels.length > 0 && !activeFunnelId) {
        setActiveFunnelId(loadedFunnels[0].id);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funis:', error);
      // Fallback para localStorage em caso de erro
      loadFunnelsFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFunnelsFromLocalStorage = () => {
    if (!user) return;
    
    const storageKey = `visual-sales-funnels-${user.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedFunnels = JSON.parse(stored);
      console.log('📱 Funis carregados do localStorage:', parsedFunnels.length);
      setFunnels(parsedFunnels);
      if (parsedFunnels.length > 0) {
        setActiveFunnelId(parsedFunnels[0].id);
      }
    }
  };

  const saveFunnelToFirestore = async (funnel: Funnel, isUpdate = false) => {
    if (!user) {
      console.log('❌ Usuário não logado, não é possível salvar');
      return null;
    }
    
    try {
      console.log('💾 Salvando funil no Firestore:', funnel.name, isUpdate ? '(atualização)' : '(novo)');
      console.log('🟢 Dados enviados para o Firestore:', JSON.stringify(funnel, null, 2));
      
      // Sanitizar dados para evitar valores undefined
      const funnelData = sanitizeObjectForFirestore({
        name: funnel.name || '',
        description: funnel.description || null, // Converter undefined para null
        products: funnel.products || [],
        userId: user.id,
        updatedAt: serverTimestamp(),
        isPublic: funnel.isPublic || false, // Garantir que isPublic tenha um valor
        audienceTarget: funnel.audienceTarget || null,
        audienceInsights: funnel.audienceInsights || null // Adicionar audienceInsights
      });
      
      if (isUpdate && funnel.id) {
        // Atualizar funil existente
        const funnelRef = doc(db, 'funnels', funnel.id);
        await updateDoc(funnelRef, funnelData);
        console.log('✅ Funil atualizado no Firestore:', funnel.id);
        return funnel.id;
      } else {
        // Criar novo funil
        const funnelsRef = collection(db, 'funnels');
        const docRef = await addDoc(funnelsRef, {
          ...funnelData,
          createdAt: serverTimestamp()
        });
        console.log('✅ Novo funil criado no Firestore:', docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar funil no Firestore:', error);
      // Fallback para localStorage
      saveFunnelsToLocalStorage();
      return null;
    }
  };

  const saveFunnelsToLocalStorage = () => {
    if (!user) return;
    
    const storageKey = `visual-sales-funnels-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(funnels));
    console.log('📱 Funis salvos no localStorage');
  };

  const createFunnel = async (funnel: Funnel) => {
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }

    console.log('🆕 Criando novo funil:', funnel.name);

    const newFunnel: Funnel = {
      ...funnel,
      id: crypto.randomUUID(), // ID temporário
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Adicionar à lista local primeiro para feedback imediato
    setFunnels(prev => [newFunnel, ...prev]);
    setActiveFunnelId(newFunnel.id);
    
    // Salvar no Firestore em background
    try {
      const firestoreId = await saveFunnelToFirestore(newFunnel, false);
      
      // Atualizar com o ID do Firestore se necessário
      if (firestoreId && firestoreId !== newFunnel.id) {
        console.log('🔄 Atualizando ID local para ID do Firestore:', firestoreId);
        setFunnels(prev => prev.map(f => 
          f.id === newFunnel.id ? { ...f, id: firestoreId } : f
        ));
        setActiveFunnelId(firestoreId);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar funil:', error);
    }
    
    return newFunnel;
  };

  const duplicateFunnel = async (funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId);
    if (!funnel) return;

    console.log('📋 Duplicando funil:', funnel.name);

    const duplicated: Funnel = {
      ...funnel,
      id: crypto.randomUUID(), // ID temporário
      name: `${funnel.name} (Cópia)`,
      products: funnel.products.map(product => ({
        ...product,
        id: crypto.randomUUID(),
        productItems: product.productItems?.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          modules: item.modules?.map(module => ({ ...module, id: crypto.randomUUID() })) || [],
          lessons: item.lessons?.map(lesson => ({ ...lesson, id: crypto.randomUUID() })) || [],
          bonuses: item.bonuses?.map(bonus => ({ ...bonus, id: crypto.randomUUID() })) || []
        })) || [],
        steps: product.steps.map(step => ({
          ...step,
          id: crypto.randomUUID()
        }))
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Adicionar à lista local primeiro
    setFunnels(prev => [duplicated, ...prev]);
    setActiveFunnelId(duplicated.id);
    
    // Salvar no Firestore
    try {
      const firestoreId = await saveFunnelToFirestore(duplicated, false);
      
      // Atualizar com o ID do Firestore se necessário
      if (firestoreId && firestoreId !== duplicated.id) {
        setFunnels(prev => prev.map(f => 
          f.id === duplicated.id ? { ...f, id: firestoreId } : f
        ));
        setActiveFunnelId(firestoreId);
      }
    } catch (error) {
      console.error('❌ Erro ao duplicar funil:', error);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    try {
      console.log('🗑️ Deletando funil (ID): ', funnelId);
      
      // Verificar se o funil existe localmente
      const funnel = funnels.find(f => f.id === funnelId);
      if (!funnel) {
        console.log('❌ Funil não encontrado localmente para deletar.');
        return;
      }
      console.log('Found funnel locally:', funnel.name);

      // Tentar deletar do Firestore
      try {
        console.log('Attempting to delete from Firestore for ID:', funnelId);
        const funnelRef = doc(db, 'funnels', funnelId);
        await deleteDoc(funnelRef);
        console.log('✅ Funil deletado do Firestore:', funnelId);
      } catch (firestoreError) {
        console.error('❌ Erro ao deletar do Firestore para ID:', funnelId, firestoreError);
        // Continuar mesmo se houver erro no Firestore para manter a consistência local
      }
      
      // Remover da lista local
      setFunnels(prev => {
        const updatedFunnels = prev.filter(f => f.id !== funnelId);
        console.log('Updated local funnels. New count:', updatedFunnels.length);
        return updatedFunnels;
      });

      if (activeFunnelId === funnelId) {
        const remaining = funnels.filter(f => f.id !== funnelId);
        setActiveFunnelId(remaining.length > 0 ? remaining[0].id : null);
        console.log('Active funnel updated after deletion.', activeFunnelId);
      }
    } catch (error) {
      console.error('❌ Erro geral ao deletar funil:', error);
      alert('Erro ao excluir o funil. Por favor, tente novamente.');
    }
  };

  const updateFunnel = async (funnelId: string, updates: Partial<Funnel>) => {
    console.log('✏️ Atualizando funil:', funnelId, updates);
    
    const updatedFunnels = funnels.map(funnel => 
      funnel.id === funnelId 
        ? { ...funnel, ...updates, updatedAt: new Date().toISOString() }
        : funnel
    );
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const updateProduct = async (funnelId: string, productId: string, updates: Partial<Product>) => {
    console.log('🔄 Atualizando produto:', productId, 'no funil:', funnelId);
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        return {
          ...funnel,
          products: funnel.products.map(product => 
            product.id === productId ? { ...product, ...updates } : product
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const updateStep = async (funnelId: string, productId: string, stepId: string, updates: Partial<Step>) => {
    console.log('🔄 Atualizando etapa:', stepId);
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        return {
          ...funnel,
          products: funnel.products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                steps: product.steps.map(step => 
                  step.id === stepId ? { ...step, ...updates } : step
                )
              };
            }
            return product;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const addProduct = async (funnelId: string, productData: Omit<Product, 'id'>) => {
    console.log('➕ Adicionando produto ao funil:', funnelId);
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        const newProduct: Product = {
          ...productData,
          id: crypto.randomUUID(),
          promessa: productData.promessa || '',
          value: productData.value || 0,
          productItems: productData.productItems?.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            modules: item.modules?.map(module => ({ ...module, id: crypto.randomUUID() })) || [],
            lessons: item.lessons?.map(lesson => ({ ...lesson, id: crypto.randomUUID() })) || [],
            bonuses: item.bonuses?.map(bonus => ({ ...bonus, id: crypto.randomUUID() })) || []
          })) || [],
          steps: productData.steps.map(step => ({
            ...step,
            id: crypto.randomUUID()
          }))
        };
        return {
          ...funnel,
          products: [...funnel.products, newProduct],
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const addStep = async (funnelId: string, productId: string, stepData: Omit<Step, 'id'>) => {
    console.log('➕ Adicionando etapa ao produto:', productId);
    console.log('🟢 Dados da etapa a ser adicionada:', JSON.stringify(stepData, null, 2));
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        return {
          ...funnel,
          products: funnel.products.map(product => {
            if (product.id === productId) {
              const newStep: Step = {
                ...stepData,
                id: crypto.randomUUID()
              };

              // Se for uma Página de Captura, garantir que seja a primeira
              if (newStep.name === 'Página de Captura') {
                newStep.order = 1;
                // Reordenar outras etapas
                const updatedSteps = product.steps.map(step => ({
                  ...step,
                  order: step.order + 1
                }));
                return {
                  ...product,
                  steps: [newStep, ...updatedSteps]
                };
              }

              // Para outras etapas, adicionar no final e manter a ordem
              const maxOrder = Math.max(...product.steps.map(s => s.order), 0);
              newStep.order = maxOrder + 1;
              return {
                ...product,
                steps: [...product.steps, newStep]
              };
            }
            return product;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      console.log('🟢 Funil atualizado antes de salvar no Firestore:', JSON.stringify(updatedFunnel, null, 2));
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const deleteStep = async (funnelId: string, productId: string, stepId: string) => {
    console.log('🗑️ Deletando etapa:', stepId);
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        return {
          ...funnel,
          products: funnel.products.map(product => {
            if (product.id === productId) {
              const stepsBeforeDelete = product.steps.length;
              const updatedSteps = product.steps.filter(step => step.id !== stepId);
              console.log(`🗑️ Etapas antes: ${stepsBeforeDelete}, depois: ${updatedSteps.length}`);
              console.log(`🗑️ Etapa ${stepId} foi ${stepsBeforeDelete !== updatedSteps.length ? 'DELETADA' : 'NÃO ENCONTRADA'}`);
              return {
                ...product,
                steps: updatedSteps
              };
            }
            return product;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      console.log('🗑️ Salvando funil atualizado no Firestore após exclusão');
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const moveProduct = async (funnelId: string, productId: string, direction: 'up' | 'down') => {
    console.log('🔄 Movendo produto:', productId, direction);
    
    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        const products = [...funnel.products].sort((a, b) => a.order - b.order);
        const currentIndex = products.findIndex(p => p.id === productId);
        
        if (currentIndex === -1) return funnel;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= products.length) return funnel;
        
        // Trocar as ordens
        const temp = products[currentIndex].order;
        products[currentIndex].order = products[newIndex].order;
        products[newIndex].order = temp;
        
        return {
          ...funnel,
          products: funnel.products.map(product => {
            const updatedProduct = products.find(p => p.id === product.id);
            return updatedProduct ? { ...product, order: updatedProduct.order } : product;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });
    
    setFunnels(updatedFunnels);
    
    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  // Função para tornar um funil público
  const makeFunnelPublic = async (funnelId: string) => {
    try {
      console.log('🌐 Tornando funil público:', funnelId);
      
      // Verificar se o funil existe localmente e se tem um ID válido do Firestore
      const funnel = funnels.find(f => f.id === funnelId);
      if (!funnel) {
        console.log('❌ Funil não encontrado localmente');
        return false;
      }
      
      // Se o ID é muito curto, provavelmente é um UUID temporário
      if (funnelId.length < 20) {
        console.log('❌ ID do funil parece ser temporário, aguarde a sincronização');
        return false;
      }
      
      const funnelRef = doc(db, 'funnels', funnelId);
      await updateDoc(funnelRef, {
        isPublic: true,
        updatedAt: serverTimestamp()
      });
      
      // Atualizar estado local
      setFunnels(prev => prev.map(f => 
        f.id === funnelId ? { ...f, isPublic: true } : f
      ));
      
      console.log('✅ Funil tornado público');
      return true;
    } catch (error) {
      console.error('❌ Erro ao tornar funil público:', error);
      return false;
    }
  };

  // Função para carregar funil público (sem autenticação)
  const loadPublicFunnel = async (funnelId: string): Promise<Funnel | null> => {
    try {
      console.log('🌐 Carregando funil público:', funnelId);
      
      const funnelRef = doc(db, 'funnels', funnelId);
      const funnelSnap = await getDoc(funnelRef);
      
      if (funnelSnap.exists()) {
        const data = funnelSnap.data();
        
        // Verificar se o funil é público
        if (!data.isPublic) {
          console.log('❌ Funil não é público');
          return null;
        }
        
        // Converter Timestamps
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString();
          
        const updatedAt = data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString();
        
        console.log('✅ Funil público carregado');
        return {
          id: funnelSnap.id,
          ...data,
          createdAt,
          updatedAt
        } as Funnel;
      } else {
        console.log('❌ Funil não encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funil público:', error);
      return null;
    }
  };

  // Função para deletar um produto
  const deleteProduct = async (funnelId: string, productId: string) => {
    console.log('🗑️ Deletando produto:', productId, 'do funil:', funnelId);

    const updatedFunnels = funnels.map(funnel => {
      if (funnel.id === funnelId) {
        return {
          ...funnel,
          products: funnel.products.filter(product => product.id !== productId),
          updatedAt: new Date().toISOString()
        };
      }
      return funnel;
    });

    setFunnels(updatedFunnels);

    // Salvar no Firestore
    const updatedFunnel = updatedFunnels.find(f => f.id === funnelId);
    if (updatedFunnel) {
      await saveFunnelToFirestore(updatedFunnel, true);
    }
  };

  const activeFunnel = funnels.find(f => f.id === activeFunnelId);

  return {
    funnels,
    activeFunnel,
    activeFunnelId,
    setActiveFunnelId,
    createFunnel,
    duplicateFunnel,
    deleteFunnel,
    updateFunnel,
    updateProduct,
    updateStep,
    addProduct,
    addStep,
    deleteStep,
    deleteProduct,
    moveProduct,
    makeFunnelPublic,
    loadPublicFunnel,
    isLoading
  };
};