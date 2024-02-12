// toLocaleString()のオプション
export const TO_LOCALE_STRING_OPTIONS = {
  'YYYY/MM/DD(weekday)_hh:mm': {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  },
  'YYYY/MM/DD(weekday)': {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  },
  'YYYY/MM/DD_hh:mm': {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
  'YYYY/MM':{
    year: 'numeric',
    month: '2-digit',
  },
  'YYYY/MM/DD':{
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  'HH:mm':{
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
} as const;
