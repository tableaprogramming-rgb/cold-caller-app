/**
 * Type definitions for the Cold Calling Tracker design system.
 * The components are authored in JSX; these ambient types provide full
 * editor autocompletion and type safety for TypeScript / TS-aware tooling.
 */
import * as React from 'react';

/* ---------------------------------------------------------------- shared */
type Size = 'sm' | 'md' | 'lg';
type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 16;
export type BadgeVariant =
  | 'owner'
  | 'editor'
  | 'viewer'
  | 'success'
  | 'info'
  | 'accent'
  | 'error'
  | 'warning'
  | 'neutral';

/* ---------------------------------------------------------------- Button */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Button: React.FC<ButtonProps>;

/* ---------------------------------------------------------------- Input */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}
export const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
>;

/* ---------------------------------------------------------------- Textarea */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
export const Textarea: React.ForwardRefExoticComponent<
  TextareaProps & React.RefAttributes<HTMLTextAreaElement>
>;

/* ---------------------------------------------------------------- Select */
export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<string | SelectOption>;
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}
export const Select: React.ForwardRefExoticComponent<
  SelectProps & React.RefAttributes<HTMLSelectElement>
>;

/* ---------------------------------------------------------------- Field */
export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export const Field: React.FC<FieldProps>;

/* ---------------------------------------------------------------- Modal */
export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  size?: Size;
  closeOnOverlay?: boolean;
  showClose?: boolean;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
export const Modal: React.FC<ModalProps>;

/* ---------------------------------------------------------------- Card */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  padded?: boolean;
}
export const Card: React.FC<CardProps>;

/* ---------------------------------------------------------------- Badge */
export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export const Badge: React.FC<BadgeProps>;
export interface StatusDotProps {
  variant?: BadgeVariant;
  className?: string;
}
export const StatusDot: React.FC<StatusDotProps>;

/* ---------------------------------------------------------------- Tabs */
export interface TabItem {
  value: string | number;
  label: React.ReactNode;
  count?: number;
}
export interface TabsProps {
  tabs?: TabItem[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  variant?: 'segment' | 'underline';
  className?: string;
}
export const Tabs: React.FC<TabsProps>;

/* ---------------------------------------------------------------- Table */
export interface TableColumn<T = any> {
  key: string;
  header?: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data?: T[];
  rowKey?: string | ((row: T, index: number) => React.Key);
  onRowClick?: (row: T) => void;
  emptyMessage?: React.ReactNode;
  className?: string;
}
export function Table<T = any>(props: TableProps<T>): React.ReactElement;

/* ---------------------------------------------------------------- Text / Link */
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  tone?:
    | 'default'
    | 'muted'
    | 'subtle'
    | 'placeholder'
    | 'strong'
    | 'primary'
    | 'error'
    | 'success';
  truncate?: boolean;
}
export const Text: React.FC<TextProps>;

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  type?: 'nav' | 'email' | 'phone' | 'external';
}
export const Link: React.FC<LinkProps>;

/* ---------------------------------------------------------------- Icon */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
  label?: string;
  src?: string;
  alt?: string;
  color?: string;
}
export const Icon: React.FC<IconProps>;

/* ---------------------------------------------------------------- Layout */
export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  gap?: SpaceToken | number | string;
  align?: string;
  justify?: string;
}
export const Stack: React.FC<StackProps>;

export interface InlineProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  gap?: SpaceToken | number | string;
  align?: string;
  justify?: string;
  wrap?: boolean;
}
export const Inline: React.FC<InlineProps>;

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  vertical?: boolean;
}
export const Divider: React.FC<DividerProps>;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
}
export const Spinner: React.FC<SpinnerProps>;
