import { CookieConditionalType } from "../../types/CookieConditionalType.js";


type CookieEvaluator<T> = (source: T[], target: T[]) => boolean;

export class ConditionalEval {
  private static evaluators: Record<CookieConditionalType, CookieEvaluator<any>> = {
    [CookieConditionalType.AND]: <T>(source: T[], target: T[]): boolean => {
      if (source.length === 0) return true;
      return source.every(item => target.includes(item));
    },

    [CookieConditionalType.OR]: <T>(source: T[], target: T[]): boolean => {
      if (source.length === 0) return false;
      return source.some(item => target.includes(item));
    },
  };

  /**
   * Evaluates condition between two arrays
   */
  static eval<T>(
    source: T[],
    target: T[],
    condition: CookieConditionalType
  ): boolean {
    const evaluator = this.evaluators[condition];
    if (!evaluator) {
      throw new Error(`Unsupported Evaluation Type: ${condition}`);
    }
    return evaluator(source, target);
  }
}