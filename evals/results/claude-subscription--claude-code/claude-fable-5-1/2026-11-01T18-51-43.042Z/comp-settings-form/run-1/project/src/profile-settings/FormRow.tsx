import type { ReactNode } from 'react';
import { Text } from '@gravity-ui/uikit';

interface FormRowProps {
  /** id контрола, чтобы клик по подписи переводил фокус в поле */
  htmlFor?: string;
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}

export function FormRow({ htmlFor, label, hint, children }: FormRowProps) {
  const labelContent = (
    <>
      <Text variant="body-2" as="span">
        {label}
      </Text>
      {hint ? (
        <Text variant="caption-2" color="secondary" as="span" className="profile-form__hint">
          {hint}
        </Text>
      ) : null}
    </>
  );

  return (
    <div className="profile-form__row">
      {htmlFor ? (
        <label className="profile-form__label" htmlFor={htmlFor}>
          {labelContent}
        </label>
      ) : (
        <div className="profile-form__label">{labelContent}</div>
      )}
      <div className="profile-form__control">{children}</div>
    </div>
  );
}
