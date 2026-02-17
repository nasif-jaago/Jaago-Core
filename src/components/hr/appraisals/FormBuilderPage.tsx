import React, { useState } from 'react';
import FormBuilder from './FormBuilder';
import FormListView from './FormListView';
import { AnimatePresence, motion } from 'framer-motion';

const FormBuilderPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'builder' | 'logs'>('list');
    const [selectedFormId, setSelectedFormId] = useState<string | undefined>(undefined);

    const handleCreateNew = () => {
        setSelectedFormId(undefined);
        setView('builder');
    };

    const handleEditForm = (id: string) => {
        setSelectedFormId(id);
        setView('builder');
    };

    const handleViewLogs = (id: string) => {
        setSelectedFormId(id);
        setView('builder'); // FormBuilder has a responses view
    };

    return (
        <div style={{ height: '100%', padding: view === 'list' ? '32px' : '0' }}>
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <FormListView
                            onCreateNew={handleCreateNew}
                            onEdit={handleEditForm}
                            onViewLogs={handleViewLogs}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: '100%' }}
                    >
                        <FormBuilder
                            initialId={selectedFormId}
                            onBack={() => setView('list')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FormBuilderPage;
