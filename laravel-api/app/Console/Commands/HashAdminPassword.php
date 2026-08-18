<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * Turns a plaintext password into the bcrypt hash for ADMIN_PASSWORD_HASH,
 * so production never has to keep the password itself in an env file.
 */
class HashAdminPassword extends Command
{
    protected $signature = 'admin:hash {password : The password to hash}';

    protected $description = 'Generate a bcrypt hash for ADMIN_PASSWORD_HASH';

    public function handle(): int
    {
        $hash = Hash::make((string) $this->argument('password'));

        $this->newLine();
        $this->line('Add this to your .env (and remove ADMIN_PASSWORD):');
        $this->newLine();
        $this->line('ADMIN_PASSWORD_HASH="'.$hash.'"');
        $this->newLine();
        $this->warn('Changing the password invalidates existing admin sessions.');

        return self::SUCCESS;
    }
}
