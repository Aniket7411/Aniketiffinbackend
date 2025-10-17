// Helper function to calculate provider profile completion
const calculateProviderCompletion = (provider) => {
    if (!provider) {
        return { percentage: 0, isComplete: false, missingFields: ['Profile not found'] };
    }

    const fields = [
        provider.displayName,
        provider.bio,
        provider.location?.address,
        provider.location?.area,
        provider.location?.city,
        provider.location?.pincode,
        provider.cuisineTypes?.length > 0,
        provider.foodType,
        provider.priceRange?.min > 0,
        provider.priceRange?.max > 0,
        provider.maxTenants > 0,
        provider.mealsOffered?.breakfast?.available || provider.mealsOffered?.lunch?.available || provider.mealsOffered?.dinner?.available,
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);

    const missingFields = [];
    if (!provider.displayName) missingFields.push('Display Name');
    if (!provider.bio) missingFields.push('Bio');
    if (!provider.location?.city) missingFields.push('Location');
    if (!provider.cuisineTypes?.length) missingFields.push('Cuisine Types');
    if (!provider.priceRange?.min || !provider.priceRange?.max) missingFields.push('Price Range');
    if (!provider.mealsOffered?.breakfast?.available && !provider.mealsOffered?.lunch?.available && !provider.mealsOffered?.dinner?.available) {
        missingFields.push('Meals Offered');
    }

    return {
        percentage,
        isComplete: percentage === 100,
        missingFields,
    };
};

// Helper function to calculate tenant profile completion
const calculateTenantCompletion = (tenant) => {
    if (!tenant) {
        return { percentage: 0, isComplete: false, missingFields: ['Profile not found'] };
    }

    const fields = [
        tenant.displayName,
        tenant.accommodationType,
        tenant.location?.address,
        tenant.location?.area,
        tenant.location?.city,
        tenant.location?.pincode,
        tenant.foodPreferences?.type,
        tenant.foodPreferences?.cuisinePreferences?.length > 0,
        tenant.budgetRange?.min > 0,
        tenant.budgetRange?.max > 0,
        tenant.mealsRequired?.breakfast?.required || tenant.mealsRequired?.lunch?.required || tenant.mealsRequired?.dinner?.required,
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);

    const missingFields = [];
    if (!tenant.displayName) missingFields.push('Display Name');
    if (!tenant.location?.city) missingFields.push('Location');
    if (!tenant.foodPreferences?.cuisinePreferences?.length) missingFields.push('Cuisine Preferences');
    if (!tenant.budgetRange?.min || !tenant.budgetRange?.max) missingFields.push('Budget Range');
    if (!tenant.mealsRequired?.breakfast?.required && !tenant.mealsRequired?.lunch?.required && !tenant.mealsRequired?.dinner?.required) {
        missingFields.push('Meals Required');
    }

    return {
        percentage,
        isComplete: percentage === 100,
        missingFields,
    };
};

module.exports = {
    calculateProviderCompletion,
    calculateTenantCompletion,
};

