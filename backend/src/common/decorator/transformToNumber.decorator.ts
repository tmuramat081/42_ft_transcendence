import { Transform, TransformFnParams } from 'class-transformer';

/**
 * リクエストパラメータの文字列を数値に変換するデコレータ
 * 文字列型として認識できない場合はそのまま返す
 */
export const TransformToNumber = (): PropertyDecorator => {
  return Transform((params: TransformFnParams): number | string => {
    if (typeof params.value === 'string') {
      return Number(params.value);
    } else {
      return params.value;
    }
  });
};
