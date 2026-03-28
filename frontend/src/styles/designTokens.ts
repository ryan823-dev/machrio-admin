/**
 * Machrio Admin 设计令牌 (Design Tokens)
 * 
 * 统一的颜色、间距、圆角、字体等设计规范
 * 基于 Ant Design 5.0 Token 系统
 */

// 颜色系统
export const colors = {
  // 主色
  primary: {
    main: '#1677ff',
    light: '#4096ff',
    lighter: '#69b1ff',
    dark: '#0958d9',
    darker: '#003a8c',
  },
  
  // 成功色
  success: {
    main: '#52c41a',
    light: '#73d13d',
    lighter: '#95de64',
    dark: '#389e0d',
    darker: '#135200',
  },
  
  // 警告色
  warning: {
    main: '#faad14',
    light: '#ffc53d',
    lighter: '#ffd666',
    dark: '#d48806',
    darker: '#ad6800',
  },
  
  // 错误色
  error: {
    main: '#ff4d4f',
    light: '#ff7875',
    lighter: '#ff9c9e',
    dark: '#d9363e',
    darker: '#a8071a',
  },
  
  // 中性色
  neutral: {
    white: '#ffffff',
    gray50: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#f0f0f0',
    gray300: '#d9d9d9',
    gray400: '#bfbfbf',
    gray500: '#8c8c8c',
    gray600: '#595959',
    gray700: '#434343',
    gray800: '#262626',
    gray900: '#141414',
    black: '#000000',
  },
  
  // 功能色
  functional: {
    info: '#1677ff',
    processing: '#1677ff',
    pending: '#faad14',
    canceled: '#d9d9d9',
  },
};

// 间距系统 (基于 4px 网格)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// 圆角系统
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// 字体系统
export const typography = {
  // 字号
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // 字重
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 行高
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // 标题样式
  heading: {
    h1: {
      fontSize: 38,
      fontWeight: 700,
      lineHeight: 1.2,
      marginBottom: 24,
    },
    h2: {
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.3,
      marginBottom: 20,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.35,
      marginBottom: 16,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: 16,
    },
    h5: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.5,
      marginBottom: 12,
    },
    h6: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.5,
      marginBottom: 12,
    },
  },
};

// 阴影系统
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  md: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  lg: '0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 12px 48px 16px rgba(0, 0, 0, 0.03)',
  xl: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};

// 响应式断点
export const breakpoints = {
  xs: '480px',   // 手机横屏
  sm: '576px',   // 小屏设备
  md: '768px',   // 平板
  lg: '992px',   // 小屏笔记本
  xl: '1200px',  // 桌面
  xxl: '1600px', // 大屏
};

// 动画
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// 常用样式组合
export const commonStyles = {
  // 卡片样式
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    background: colors.neutral.white,
    boxShadow: shadows.sm,
  },
  
  // 按钮尺寸
  button: {
    small: {
      height: 24,
      padding: `0 ${spacing.sm}px`,
      fontSize: typography.fontSize.xs,
    },
    medium: {
      height: 32,
      padding: `0 ${spacing.md}px`,
      fontSize: typography.fontSize.sm,
    },
    large: {
      height: 40,
      padding: `0 ${spacing.lg}px`,
      fontSize: typography.fontSize.md,
    },
  },
  
  // 输入框尺寸
  input: {
    small: {
      height: 24,
      padding: `4px ${spacing.sm}px`,
    },
    medium: {
      height: 32,
      padding: `6px ${spacing.md}px`,
    },
    large: {
      height: 40,
      padding: `10px ${spacing.lg}px`,
    },
  },
};

// 导出 Ant Design theme 配置
export const antdTheme = {
  token: {
    colorPrimary: colors.primary.main,
    colorSuccess: colors.success.main,
    colorWarning: colors.warning.main,
    colorError: colors.error.main,
    colorInfo: colors.functional.info,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  components: {
    Button: {
      borderRadius: borderRadius.md,
      controlHeight: 32,
      controlHeightSM: 24,
      controlHeightLG: 40,
    },
    Input: {
      borderRadius: borderRadius.md,
      controlHeight: 32,
      controlHeightSM: 24,
      controlHeightLG: 40,
    },
    Select: {
      borderRadius: borderRadius.md,
      controlHeight: 32,
    },
    Card: {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    Table: {
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    Modal: {
      borderRadiusLG: borderRadius.lg,
      paddingContent: spacing.lg,
    },
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
  transitions,
  commonStyles,
  antdTheme,
};
