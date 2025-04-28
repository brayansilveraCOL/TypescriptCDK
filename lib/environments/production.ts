export const ProductionEnv = {
    account: process.env.CDK_PROD_ACCOUNT || '000000000000',
    region: process.env.CDK_PROD_REGION || '000000000000'
};
