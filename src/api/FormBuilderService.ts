import { supabase } from '../lib/supabase';

export interface Form {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'published';
    created_by: string;
    created_at: string;
    updated_at: string;
    theme_config?: any;
    settings?: any;
}

export interface FormQuestion {
    id: string;
    form_id: string;
    type: 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'date' | 'time' | 'linear_scale' | 'mc_grid' | 'cb_grid';
    label: string;
    description?: string;
    options_json?: any;
    required: boolean;
    order_index: number;
    logic_config?: any;
}

export interface FormResponse {
    id: string;
    form_id: string;
    submitted_at: string;
    submitted_by?: string;
    respondent_email?: string;
    metadata?: any;
}

export interface FormResponseDetail {
    id: string;
    response_id: string;
    question_id: string;
    answer_value: any;
}

export const FormBuilderService = {
    async fetchForms() {
        try {
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error('Fetch Forms Error:', err);
            // Fallback to localStorage for demo
            const local = JSON.parse(localStorage.getItem('jaago_forms') || '[]');
            return { success: true, data: local };
        }
    },

    async fetchFormById(id: string) {
        try {
            const { data: form, error: formError } = await supabase
                .from('forms')
                .select('*')
                .eq('id', id)
                .single();
            if (formError) throw formError;

            const { data: questions, error: qError } = await supabase
                .from('form_questions')
                .select('*')
                .eq('form_id', id)
                .order('order_index', { ascending: true });
            if (qError) throw qError;

            return { success: true, data: { ...form, questions } };
        } catch (err: any) {
            console.error('Fetch Form Detail Error:', err);
            const local = JSON.parse(localStorage.getItem('jaago_forms') || '[]');
            const form = local.find((f: any) => f.id === id);
            return { success: true, data: form };
        }
    },

    async saveForm(form: Partial<Form>, questions: Partial<FormQuestion>[]) {
        try {
            const { data, error } = await supabase
                .from('forms')
                .upsert({
                    ...form,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            if (error) throw error;

            const formId = data.id;

            // Simple strategy: delete existing questions and re-insert
            await supabase.from('form_questions').delete().eq('form_id', formId);

            const { error: qError } = await supabase
                .from('form_questions')
                .insert(questions.map((q, i) => ({ ...q, form_id: formId, order_index: i })));
            if (qError) throw qError;

            return { success: true, data };
        } catch (err: any) {
            console.error('Save Form Error:', err);
            const local = JSON.parse(localStorage.getItem('jaago_forms') || '[]');
            const updatedForm = { ...form, id: form.id || Math.random().toString(36).substr(2, 9), questions, updated_at: new Date().toISOString() };
            const index = local.findIndex((f: any) => f.id === updatedForm.id);
            if (index > -1) local[index] = updatedForm;
            else local.push(updatedForm);
            localStorage.setItem('jaago_forms', JSON.stringify(local));
            return { success: true, data: updatedForm };
        }
    },

    async deleteForm(id: string) {
        try {
            const { error } = await supabase.from('forms').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            console.error('Delete Form Error:', err);
            const local = JSON.parse(localStorage.getItem('jaago_forms') || '[]');
            localStorage.setItem('jaago_forms', JSON.stringify(local.filter((f: any) => f.id !== id)));
            return { success: true };
        }
    },

    async submitResponse(response: Partial<FormResponse>, details: Partial<FormResponseDetail>[]) {
        try {
            const { data, error } = await supabase
                .from('form_responses')
                .insert([{ ...response, submitted_at: new Date().toISOString() }])
                .select()
                .single();
            if (error) throw error;

            const responseId = data.id;
            const { error: dError } = await supabase
                .from('form_response_details')
                .insert(details.map(d => ({ ...d, response_id: responseId })));
            if (dError) throw dError;

            return { success: true };
        } catch (err: any) {
            console.error('Submit Response Error:', err);
            const local = JSON.parse(localStorage.getItem('jaago_form_responses') || '[]');
            local.push({ ...response, details, id: Math.random().toString(36).substr(2, 9), submitted_at: new Date().toISOString() });
            localStorage.setItem('jaago_form_responses', JSON.stringify(local));
            return { success: true };
        }
    },

    async fetchResponses(formId: string) {
        try {
            const { data, error } = await supabase
                .from('form_responses')
                .select('*, form_response_details(*)')
                .eq('form_id', formId)
                .order('submitted_at', { ascending: false });
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error('Fetch Responses Error:', err);
            const local = JSON.parse(localStorage.getItem('jaago_form_responses') || '[]');
            return { success: true, data: local.filter((r: any) => r.form_id === formId) };
        }
    }
};
