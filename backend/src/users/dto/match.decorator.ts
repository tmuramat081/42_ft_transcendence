/* eslint-disable */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

// 解説
/*
このコードは、TypeScriptまたはJavaScriptで使用されるclass-validatorライブラリのカスタムバリデーションデコレータを定義しています。この特定のデコレータはMatchと呼ばれ、2つのプロパティ間の値が一致するかどうかを検証するために使われます。これは、例えばパスワードとパスワード確認フィールドが一致するかを検証する際に便利です。

コードの各部分の説明：

Match関数: これはカスタムデコレータを定義するファクトリ関数です。この関数はproperty（比較対象のプロパティ名）とvalidationOptions（任意のバリデーションオプション）を受け取ります。

registerDecorator関数: これはclass-validatorの関数で、新しいバリデーションデコレータを登録します。この関数には、デコレータが適用されるクラスのコンストラクタ、プロパティ名、バリデーションオプション、制約（この場合は比較対象のプロパティ名）、そしてバリデータの実装が含まれます。

MatchConstraintクラス: これはValidatorConstraintInterfaceを実装するクラスで、validateメソッドを提供します。このメソッドは、デコレータが適用されたプロパティの値（value）と比較対象のプロパティの値（relatedValue）が同じかどうかをチェックします。

このカスタムデコレータは、クラスのプロパティに対して適用され、そのプロパティが別の指定されたプロパティと同じ値を持つかどうかを検証します。もし値が一致しなければ、バリデーションは失敗します。
*/

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'match', async: false })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}