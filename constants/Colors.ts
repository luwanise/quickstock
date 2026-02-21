const tintColorLight = '#2E8B57';
const tintColorDark = '#73c797';

const dangerColorLight = '#dd4545';
const dangerColorDark = '#e65656';

const warningColorLight = '#f5a623';
const warningColorDark = '#f0b34b';

const successColorLight = '#28a745';
const successColorDark = '#34c759';

export default {
  light: {
    text: '#000',
    textSecondary: '#666',
    background: '#fff',
    tint: tintColorLight,
    tintText: '#fff',
    danger: dangerColorLight,
    warning: warningColorLight,
    success: successColorLight,
    border: '#e0e0e0',
    progressBackground: '#f0f0f0',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    textSecondary: '#aaa',
    background: '#1c1c1e',
    tint: tintColorDark,
    tintText: '#000',
    danger: dangerColorDark,
    warning: warningColorDark,
    success: successColorDark,
    border: '#38383a',
    progressBackground: '#2c2c2e',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};