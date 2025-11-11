import { CookieCondition } from "./CookieType.js";

type CookieEvaluator<T> = (source: T[], target: T[]) => boolean;

export class ConditionalEval {
  private static evaluators: Record<CookieCondition, CookieEvaluator<any>> = {
    [CookieCondition.AND]: <T>(source: T[], target: T[]): boolean => {
      if (source.length === 0) return true;
      return source.every(item => target.includes(item));
    },

    [CookieCondition.OR]: <T>(source: T[], target: T[]): boolean => {
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
    condition: CookieCondition
  ): boolean {
    const evaluator = this.evaluators[condition];
    if (!evaluator) {
      throw new Error(`Unsupported Evaluation Type: ${condition}`);
    }
    return evaluator(source, target);
  }
}