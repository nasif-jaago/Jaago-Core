import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppraisalDashboard from './appraisals/AppraisalDashboard';

interface AppraisalsPageProps {
    onBack?: () => void;
}

const AppraisalsPage: React.FC<AppraisalsPageProps> = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <AppraisalDashboard
                        onSelectStat={(filter) => {
                            console.log('Selected stat filter:', filter);
                        }}
                        initialSubView="logs"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AppraisalsPage;
