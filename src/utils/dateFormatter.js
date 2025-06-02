/**
 * Utilitários para formatação de datas no frontend
 */

/**
 * Formata data em formato bonito e localizado
 * @param {string|Date|Object} dateInput - Data para formatar
 * @param {string} format - Formato desejado: 'full', 'short', 'time', 'relative'
 * @returns {string} Data formatada
 */
export const formatDate = (dateInput, format = 'full') => {
  if (!dateInput) return 'Data não disponível';
  
  try {
    let date;
    
    // ✅ CORRIGIDO: Suportar tanto `seconds` quanto `_seconds` do Firestore
    if (dateInput.seconds || dateInput._seconds) {
      // Timestamp do Firestore (pode vir como `seconds` ou `_seconds`)
      const seconds = dateInput.seconds || dateInput._seconds;
      const nanoseconds = dateInput.nanoseconds || dateInput._nanoseconds || 0;
      date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));
    } else if (dateInput.toDate && typeof dateInput.toDate === 'function') {
      // Timestamp do Firestore com método toDate()
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      // String ISO
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      console.warn('Tipo de data não reconhecido:', dateInput);
      return 'Data inválida';
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.warn('Data inválida após conversão:', dateInput);
      return 'Data inválida';
    }
    
    const options = {
      full: {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      short: {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      },
      date: {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit'
      }
    };
    
    const locale = navigator.language || 'pt-BR';
    return date.toLocaleDateString(locale, options[format] || options.full);
    
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Input:', dateInput);
    return 'Data inválida';
  }
};

/**
 * Formata data relativa (ex: "há 2 horas", "em 3 dias")
 * @param {string|Date|Object} dateInput - Data para comparar
 * @returns {string} Tempo relativo
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    // ✅ CORRIGIDO: Suportar tanto `seconds` quanto `_seconds` do Firestore
    if (dateInput.seconds || dateInput._seconds) {
      const seconds = dateInput.seconds || dateInput._seconds;
      const nanoseconds = dateInput.nanoseconds || dateInput._nanoseconds || 0;
      date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));
    } else if (dateInput.toDate && typeof dateInput.toDate === 'function') {
      // Timestamp do Firestore com método toDate()
      date = dateInput.toDate();
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = date - now;
    const absDiffMs = Math.abs(diffMs);
    
    const minutes = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(absDiffMs / 3600000);
    const days = Math.floor(absDiffMs / 86400000);
    
    const isFuture = diffMs > 0;
    
    if (minutes < 1) {
      return isFuture ? 'em breve' : 'agora mesmo';
    } else if (minutes < 60) {
      return isFuture 
        ? `em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
        : `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (hours < 24) {
      return isFuture
        ? `em ${hours} ${hours === 1 ? 'hora' : 'horas'}`
        : `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return isFuture
        ? `em ${days} ${days === 1 ? 'dia' : 'dias'}`
        : `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  } catch (error) {
    console.warn('Erro ao formatar tempo relativo:', error, 'Input:', dateInput);
    return '';
  }
};

/**
 * Formata duração estimada (ex: "30 minutes" para "30 minutos")
 * @param {string} duration - Duração em inglês
 * @returns {string} Duração traduzida
 */
export const formatDuration = (duration) => {
  if (!duration) return '';
  
  const match = duration.match(/^(\d+)\s*(minutes?|hours?|days?)$/i);
  if (!match) return duration;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const translations = {
    'minute': value === 1 ? 'minuto' : 'minutos',
    'minutes': 'minutos',
    'hour': value === 1 ? 'hora' : 'horas',
    'hours': 'horas',
    'day': value === 1 ? 'dia' : 'dias',
    'days': 'dias'
  };
  
  return `${value} ${translations[unit] || unit}`;
};

/**
 * 🔧 CORRIGIDO: Formata data para exibição em etapas - SEM PREVISÕES
 * @param {Object} step - Objeto da etapa
 * @returns {string} Texto formatado para exibição
 */
export const formatStepDate = (step) => {
  // Se etapa está concluída, mostrar data de conclusão
  if (step.completed && step.completedAt) {
    return `Completed ${formatRelativeTime(step.completedAt)}`;
  }
  
  // Se é etapa atual, sempre mostrar "In Progress" - SEM PREVISÃO
  if (step.current || step.active) {
    return 'In Progress';
  }
  
  // Se é etapa futura, mostrar "Pending"
  return 'Pending';
};

/**
 * Verifica se deve mostrar horário da etapa
 * @param {Object} step - Objeto da etapa
 * @returns {boolean} True se deve mostrar horário
 */
export const shouldShowStepTime = (step) => {
  // Só mostrar horário se a etapa está concluída
  return step.completed && step.completedAt;
};

/**
 * Formata horário específico de uma etapa
 * @param {Object} step - Objeto da etapa
 * @returns {string} Horário formatado ou vazio
 */
export const formatStepTime = (step) => {
  if (!shouldShowStepTime(step)) return '';
  
  return formatDate(step.completedAt, 'time');
};

/**
 * ✅ NOVA: Função helper para debug de datas
 * @param {any} dateInput - Data para debug
 * @param {string} context - Contexto onde está sendo usada
 */
export const debugDate = (dateInput, context = 'unknown') => {
  console.log(`🔍 DEBUG DATE [${context}]:`, {
    input: dateInput,
    type: typeof dateInput,
    hasSeconds: !!(dateInput?.seconds),
    has_seconds: !!(dateInput?._seconds),
    hasToDate: !!(dateInput?.toDate),
    isDate: dateInput instanceof Date,
    formatted: formatDate(dateInput)
  });
};

/**
 * ✅ NOVA: Função para verificar se data é válida
 * @param {any} dateInput - Data para verificar
 * @returns {boolean} True se a data é válida
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    const formatted = formatDate(dateInput);
    return formatted !== 'Data inválida' && formatted !== 'Data não disponível';
  } catch {
    return false;
  }
};