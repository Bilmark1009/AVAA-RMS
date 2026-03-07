<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerProfile extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'company_website', 'industry',
        'company_size', 'company_description', 'logo_path',
        'headquarters_address', 'city', 'state', 'country', 'postal_code',
        'fein_tax_id', 'business_registration_number', 'year_established',
        'linkedin_url', 'facebook_url', 'twitter_url', 'instagram_url',
        'is_verified', 'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}