<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:190'],
            'password' => ['required', 'string', 'max:190'],
        ];
    }

    /**
     * Malformed input reads as a failed login rather than a field-by-field
     * report — it tells an attacker nothing about which half was wrong, and the
     * sign-in form already renders exactly this message.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            back()
                ->withInput($this->only('email'))
                ->withErrors(['email' => 'Wrong email or password.']),
        );
    }
}
