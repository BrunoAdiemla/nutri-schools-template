-- =====================================================
-- MIGRATION: Add 'outro' option to funcao field
-- =====================================================
-- Execute this in the Supabase SQL Editor to update the funcao constraint

-- Remove the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_funcao_check;

-- Add the new constraint with 'outro' option
ALTER TABLE public.users ADD CONSTRAINT users_funcao_check 
CHECK (funcao IN ('nutricionista', 'gestor', 'outro'));

-- Verify the constraint was updated
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
    AND conname = 'users_funcao_check';