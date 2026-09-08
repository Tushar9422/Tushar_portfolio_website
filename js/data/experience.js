export const experiences = [
    {
        role: 'Software Engineer - Trainee',
        organization: 'Accenture (Remote)',
        duration: 'Jul 2026 - Present',
        summary: 'Developing a retail omni-channel loyalty and rewards application with SAP CAP and Node.js.',
        highlights: [
            'Designed relational data models for customers, transactions, products, rewards, and redemptions.',
            'Implemented backend business logic, data validation, points calculation, loyalty tiers, and reward redemption.',
            'Built a product recommendation pipeline using SAP HANA PAL and association-rule mining across 120K+ transaction-item records and 8K+ products, generating 500+ rules with 75%+ confidence.'
        ],
        technologies: ['Machine Learning', 'SAP CAP', 'Node.js', 'SAP HANA Cloud', 'SAP HANA PAL']
    },
    {
        role: 'Data Science Intern',
        organization: 'DAAKit Technologies Pvt. Ltd. (Onsite)',
        duration: 'Jan 2026 - Jul 2026',
        summary: 'Developed forecasting, SLA planning, and KYC automation systems for multi-client operations.',
        highlights: [
            'Developed a multi-client demand forecasting system using two-stage LightGBM with lag, rolling, intermittent-demand, and hierarchical features across 4.1M+ source rows and 584K+ target-domain rows.',
            'Applied transfer learning and client personalization, reducing test WAPE by 26% from 0.647 to 0.478 against the naive baseline.',
            'Designed a multi-tier HLD/SDD/NDD SLA engine across 177 pincodes, modeling 59.32% peak HLD coverage and reducing modeled fleet requirements by 67%.',
            'Integrated an end-to-end KYC API with Surepass OCR/verification and DigiLocker, maintaining an 85%+ automated approval rate for low-risk cases.'
        ],
        technologies: ['Python', 'Scikit-learn', 'Machine Learning', 'APIs', 'Transfer Learning']
    }
];
