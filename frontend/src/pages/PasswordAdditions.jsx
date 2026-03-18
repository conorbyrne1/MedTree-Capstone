import React from 'react';
import './PasswordAdditions.css';

const MAX_PASSWORD_LENGTH = 8;
const requirements = [
    { label: `At least ${MAX_PASSWORD_LENGTH} characters`, test: p => p.length >= MAX_PASSWORD_LENGTH },
    { label: 'At least one uppercase letter', test: p => /[A-Z]/.test(p) },
    { label: 'At least one lowercase letter', test: p => /[a-z]/.test(p) },
    { label: 'At least one number', test: p => /[0-9]/.test(p) },
    { label: 'At least one special character', test: p => /[^&A-Za-z0-9]/.test(p) },
];

const PasswordAdditions = ({ password }) => {
    if (!password) return null;

    return (
        <u1 className="pw-requirements">
            {requirements.map((req, i) => {
                const met = req.test(password);
                return (
                    <li key={i} className={`pw-req ${met ? 'met' : ''}`}>
                        <span className="pw-dot" />
                        {req.label}
                    </li>
                );
            })}
        </u1>
    );
};

export default PasswordAdditions;

export const PasswordInput = ({ value, onChange, placeholder, className, id, name, required }) => {
    const [show, setShow] = React.useState(false);

    return (
        <div className={"pw-visibility-wrap"}>
            <input
                id={id}
                name={name}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                required={required}
                autoComplete={"current-password"}
            />
            <button
                type="button"
                className={"pw-visibility-btn"}
                onClick={() => setShow(s => !s)}
                tabIndex={-1}
                aria-label={show ? 'Hide Password' : 'Show Password'}
            >
                {show ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    )
}