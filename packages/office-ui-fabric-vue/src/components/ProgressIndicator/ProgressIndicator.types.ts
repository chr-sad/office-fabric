import { IStyle, ITheme } from '@uifabric/styling'
import { IStyleFunctionOrObject } from '@uifabric-vue/utilities'
import { IBaseProps } from '@/types'

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorProps extends IBaseProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IProgressIndicatorStyleProps, IProgressIndicatorStyles>;

  /**
   * Theme provided by High-Order Component.
   */
  theme?: ITheme;

  /**
   * Additional css class to apply to the ProgressIndicator
   * @defaultvalue undefined
   */
  className?: string;

  /**
   * Label to display above the control.
   */
  label?: string;

  /**
   * Text describing or supplementing the operation.
   */
  description?: string;

  /**
   * Percentage of the operation's completeness, numerically between 0 and 1. If this is not set,
   * the indeterminate progress animation will be shown instead.
   */
  percentComplete?: number;

  /**
   * Whether or not to hide the progress state.
   */
  progressHidden?: boolean;

  /**
   * A render override for the progress track.
   */
  // onRenderProgress?: IRenderFunction<IProgressIndicatorProps>;

  /**
   * Text alternative of the progress status, used by screen readers for reading the value of the progress.
   */
  ariaValueText?: string;

  /**
   * Height of the ProgressIndicator
   * @defaultvalue 2
   */
  barHeight?: number;
}

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorStyleProps {
  /**
   * Theme provided by High-Order Component.
   */
  theme: ITheme;

  /**
   * Accept custom classNames
   */
  className?: string;
  indeterminate?: boolean;
  barHeight?: number;
}

/**
 * {@docCategory ProgressIndicator}
 */
export interface IProgressIndicatorStyles {
  /**
   * Style for the root element.
   */
  root: IStyle;
  itemName: IStyle;
  itemDescription: IStyle;
  itemProgress: IStyle;
  progressTrack: IStyle;
  progressBar: IStyle;
}
