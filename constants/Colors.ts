const tintColorLight = '#2E8B57';
const tintColorDark = '#73c797';

const dangerColorLight = '#dd4545';
const dangerColorDark = '#e65656';

const warningColorLight = '#f5a623';
const warningColorDark = '#f0b34b';

const successColorLight = '#28a745';
const successColorDark = '#34c759';

const chartColors = {
  primary: ['#2E8B57', '#73c797'],
  secondary: ['#FF6B6B', '#FF8E8E'],
  accent1: ['#4ECDC4', '#6FD1C9'],
  accent2: ['#FFB347', '#FFC46B'],
  accent3: ['#9B59B6', '#B07CC6'],
  accent4: ['#3498DB', '#5DADE2'],
};

const cardColors = {
  light: {
    background: '#ffffff',
    elevation: '#f0f0f0',
  },
  dark: {
    background: '#2c2c2e',
    elevation: '#3a3a3c',
  },
};

export default {
  light: {
    text: '#000',
    textSecondary: '#666',
    background: '#f8f9fa',
    tint: tintColorLight,
    tintText: '#fff',
    danger: dangerColorLight,
    warning: warningColorLight,
    success: successColorLight,
    border: '#e0e0e0',
    progressBackground: '#f0f0f0',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    card: cardColors.light.background,
    cardElevated: cardColors.light.elevation,
    chart: chartColors,
  },
  dark: {
    text: '#fff',
    textSecondary: '#aaa',
    background: '#202020',
    tint: tintColorDark,
    tintText: '#000',
    danger: dangerColorDark,
    warning: warningColorDark,
    success: successColorDark,
    border: '#38383a',
    progressBackground: '#2c2c2e',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    card: cardColors.dark.background,
    cardElevated: cardColors.dark.elevation,
    chart: chartColors,
  },
};