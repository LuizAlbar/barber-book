import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { capitalService, authService } from '../services/api';
import AddCapitalModal from '../components/AddCapitalModal';
import { theme } from '../styles/theme';

interface MonthOption {
  year: number;
  month: number;
  label: string;
  isClosingMonth: boolean;
}

export default function DashboardScreen({ navigation }: any) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'PROFIT' | 'COST'>('PROFIT');
  const [capitalData, setCapitalData] = useState<any[]>([]);
  const [allCapitalData, setAllCapitalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, description: string} | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{year: number, month: number}>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  // Calcular mês de fechamento (último mês completo)
  const getClosingMonth = (): {year: number, month: number} => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { year: lastMonth.getFullYear(), month: lastMonth.getMonth() };
  };

  // Gerar lista de meses disponíveis (últimos 12 meses)
  const generateMonthOptions = (): MonthOption[] => {
    const options: MonthOption[] = [];
    const now = new Date();
    const closingMonth = getClosingMonth();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const isClosingMonth = year === closingMonth.year && month === closingMonth.month;
      
      options.push({
        year,
        month,
        label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        isClosingMonth,
      });
    }
    
    return options;
  };

  const loadCapitalData = async () => {
    try {
      setLoading(true);
      
      // Buscar barbershopId do perfil do usuário
      let shopId = barbershopId;
      
      if (!shopId) {
        const profileResponse = await authService.getProfile();
        
        if (profileResponse.user.barbershops && profileResponse.user.barbershops.length > 0) {
          shopId = profileResponse.user.barbershops[0].id;
        } else if (profileResponse.user.employees && profileResponse.user.employees.length > 0) {
          shopId = profileResponse.user.employees[0].barbershopId;
        }
        
        if (!shopId) {
          Alert.alert('Erro', 'Nenhuma barbearia encontrada para este usuário');
          setLoading(false);
          return;
        }
        
        setBarbershopId(shopId);
      }
      
      // Carregar todos os dados (sem filtro de mês na API)
      const response = await capitalService.list(shopId);
      setAllCapitalData(response.capital || []);
      
      // Filtrar por mês selecionado
      filterDataByMonth(response.capital || [], selectedMonth);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const filterDataByMonth = (data: any[], month: {year: number, month: number}) => {
    const filtered = data.filter(item => {
      const itemDate = new Date(item.datetime);
      return itemDate.getFullYear() === month.year && itemDate.getMonth() === month.month;
    });
    setCapitalData(filtered);
  };

  useEffect(() => {
    loadCapitalData();
  }, []);

  useEffect(() => {
    if (allCapitalData.length > 0) {
      filterDataByMonth(allCapitalData, selectedMonth);
    }
  }, [selectedMonth]);

  const handleAddCapital = async (data: { value: number; description: string; type: string }) => {
    if (!barbershopId) {
      Alert.alert('Erro', 'Barbearia não encontrada');
      return;
    }
    
    try {
      await capitalService.create({
        value: data.value,
        type: data.type as 'PROFIT' | 'COST',
        description: data.description,
        barbershopId: barbershopId
      });
      Alert.alert('Sucesso', `${data.type === 'PROFIT' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
      loadCapitalData(); // Recarregar dados
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a movimentação');
    }
  };

  const handleDeleteCapital = (id: string, description: string) => {
    console.log('🗑️ Botão excluir clicado para ID:', id);
    setItemToDelete({ id, description });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        console.log('🔥 Excluindo movimentação:', itemToDelete.id);
        await capitalService.delete(itemToDelete.id);
        console.log('✅ Movimentação excluída com sucesso');
        Alert.alert('Sucesso', 'Movimentação excluída com sucesso!');
        loadCapitalData();
      } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        Alert.alert('Erro', 'Não foi possível excluir a movimentação');
      }
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const monthOptions = generateMonthOptions();
  const closingMonth = getClosingMonth();
  const isSelectedClosingMonth = selectedMonth.year === closingMonth.year && selectedMonth.month === closingMonth.month;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity 
            style={[styles.monthSelector, isSelectedClosingMonth && styles.monthSelectorClosing]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.monthSelectorText, isSelectedClosingMonth && styles.monthSelectorTextClosing]}>
              {new Date(selectedMonth.year, selectedMonth.month, 1).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            {isSelectedClosingMonth && (
              <View style={styles.closingBadge}>
                <Text style={styles.closingBadgeText}>Fechamento</Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={loadCapitalData}>
          <Ionicons name="refresh-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={32} color={theme.colors.success} />
            <Text style={styles.cardValue}>
              R$ {capitalData
                .filter(item => item.type === 'PROFIT')
                .reduce((sum, item) => sum + item.value, 0)
                .toFixed(2)
                .replace('.', ',')}
            </Text>
            <Text style={styles.cardLabel}>Receitas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down" size={32} color={theme.colors.error} />
            <Text style={styles.cardValue}>
              R$ {capitalData
                .filter(item => item.type === 'COST')
                .reduce((sum, item) => sum + item.value, 0)
                .toFixed(2)
                .replace('.', ',')}
            </Text>
            <Text style={styles.cardLabel}>Despesas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Movimentação</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.success }]}
              onPress={() => {
                console.log('💰 Botão Receita clicado');
                setModalType('PROFIT');
                setShowModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.error }]}
              onPress={() => {
                console.log('💸 Botão Despesa clicado');
                setModalType('COST');
                setShowModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Carregando...</Text>
            </View>
          ) : capitalData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
            </View>
          ) : (
            capitalData.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.movementCard}>
                <View style={styles.movementLeft}>
                  <Ionicons 
                    name={item.type === 'PROFIT' ? 'trending-up' : 'trending-down'} 
                    size={24} 
                    color={item.type === 'PROFIT' ? theme.colors.success : theme.colors.error} 
                  />
                  <View style={styles.movementInfo}>
                    <Text style={styles.movementDescription}>{item.description}</Text>
                    <Text style={styles.movementDate}>
                      {new Date(item.datetime).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
                <View style={styles.movementRight}>
                  <Text style={[
                    styles.movementValue,
                    { color: item.type === 'PROFIT' ? theme.colors.success : theme.colors.error }
                  ]}>
                    {item.type === 'PROFIT' ? '+' : '-'}R$ {item.value.toFixed(2).replace('.', ',')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      console.log('🎯 TouchableOpacity delete pressionado!');
                      handleDeleteCapital(item.id, item.description);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Agendamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
          <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Config')}
        >
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Config</Text>
        </TouchableOpacity>
      </View>

      <AddCapitalModal
        visible={showModal}
        type={modalType}
        onClose={() => setShowModal(false)}
        onAdd={handleAddCapital}
      />

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Movimentação</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir "{itemToDelete?.description}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Mês */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Mês</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={monthOptions}
              renderItem={({ item }) => {
                const isSelected = selectedMonth.year === item.year && selectedMonth.month === item.month;
                return (
                  <TouchableOpacity
                    style={[
                      styles.monthOption,
                      isSelected && styles.monthOptionSelected,
                      item.isClosingMonth && styles.monthOptionClosing
                    ]}
                    onPress={() => {
                      setSelectedMonth({ year: item.year, month: item.month });
                      setShowMonthPicker(false);
                    }}
                  >
                    <View style={styles.monthOptionContent}>
                      <Text style={[
                        styles.monthOptionText,
                        isSelected && styles.monthOptionTextSelected
                      ]}>
                        {item.label}
                      </Text>
                      {item.isClosingMonth && (
                        <View style={styles.closingBadgeSmall}>
                          <Text style={styles.closingBadgeTextSmall}>Mês de Fechamento</Text>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => `${item.year}-${item.month}-${index}`}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerLeft: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  monthSelectorClosing: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255, 203, 36, 0.2)',
  },
  monthSelectorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  monthSelectorTextClosing: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  closingBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.xs,
  },
  closingBadgeText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  monthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  monthOptionSelected: {
    backgroundColor: 'rgba(255, 203, 36, 0.2)',
  },
  monthOptionClosing: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  monthOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  monthOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  monthOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  closingBadgeSmall: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  closingBadgeTextSmall: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: '#999',
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  movementCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  movementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  movementInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  movementDescription: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  movementDate: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  movementValue: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  movementRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: theme.borderRadius.sm,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    backgroundColor: '#666',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  deleteModalButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
