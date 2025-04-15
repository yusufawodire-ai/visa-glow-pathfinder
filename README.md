
# Visa Evaluation Application

This application allows users to submit their documents for visa eligibility assessment and get personalized recommendations.

## Database Schema

### Table: visa_evaluations

Stores the results of visa eligibility evaluations:

| Column     | Type                     | Description                                  |
|------------|--------------------------|----------------------------------------------|
| id         | UUID                     | Primary key (automatically generated)        |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp (automatically generated) |
| user_id    | TEXT                     | Identifier for the user                      |
| name       | TEXT                     | User's full name                             |
| email      | TEXT                     | User's email address                         |
| phone      | TEXT                     | User's phone number (optional)               |
| visa_type  | TEXT                     | Type of visa being applied for               |
| score      | INTEGER                  | Calculated eligibility score (0-100)         |
| overview   | TEXT                     | Detailed overview of the evaluation          |

## Setting Up in Supabase

1. Connect your Lovable project to Supabase
2. Run the SQL migrations in the `supabase/migrations` folder
3. Ensure environment variables are set:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
