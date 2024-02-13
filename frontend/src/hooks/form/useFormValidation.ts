import { ChangeEvent, SetStateAction, useState } from 'react';

export interface Field {
  // フィールドの値
  value: string;
  // エラーの有無
  hasError: boolean;
  // 必須チェックの有無
  isRequired: boolean;
  // 最大文字数
  maxLength?: number;
  // エラーメッセージ
  errorMessages: string[];
}

export interface FormFields {
  [key: string]: Field;
}

export interface ValidationResults {
  // 入力フィールドの値と状態
  fields: FormFields;
  // 入力フィールドが変更された場合のハンドラ
  handleFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  // stateの更新関数
  setFields: (value: SetStateAction<FormFields>) => void;
}

/**
 * useFormValidation - 入力フォームの状態管理を行うカスタムフック
 */
export function useFormValidation(initialFields: FormFields): ValidationResults {
  const [fields, setFields] = useState<FormFields>(initialFields);

  // フィールドの値が変更されたときに呼ばれる
  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const currentField = fields[name];

    let hasError = false;
    const errorMessages: Array<string> = [];

    // 必須チェック
    if (currentField.isRequired && value === '') {
      hasError = true;
      errorMessages.push('必須項目です。');
    }

    // 桁数チェック
    if (currentField.maxLength && currentField.maxLength < value.replace(/[\n\s]/g, '').length) {
      hasError = true;
      errorMessages.push(`${currentField.maxLength}文字以内で入力してください。`);
    }
    setFields({
      ...fields,
      [name]: {
        ...currentField,
        value,
        hasError,
        errorMessages,
      },
    });
  };
  return { fields, handleFieldChange, setFields };
}
