/**
 * MRMC Study Dashboard - Statistics Module
 * Statistical calculations for hypothesis testing
 */

const Statistics = {
    /**
     * Calculate mean of an array
     * @param {Array<number>} arr
     * @returns {number}
     */
    mean(arr) {
        if (!arr || arr.length === 0) return 0;
        const filtered = arr.filter(x => x !== null && x !== undefined && !isNaN(x));
        if (filtered.length === 0) return 0;
        return filtered.reduce((a, b) => a + b, 0) / filtered.length;
    },

    /**
     * Calculate standard deviation
     * @param {Array<number>} arr
     * @returns {number}
     */
    std(arr) {
        if (!arr || arr.length < 2) return 0;
        const filtered = arr.filter(x => x !== null && x !== undefined && !isNaN(x));
        if (filtered.length < 2) return 0;

        const avg = this.mean(filtered);
        const squaredDiffs = filtered.map(x => Math.pow(x - avg, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (filtered.length - 1));
    },

    /**
     * Pearson correlation coefficient
     * @param {Array<number>} x
     * @param {Array<number>} y
     * @returns {Object} { r, pValue }
     */
    pearsonCorrelation(x, y) {
        // Filter out pairs with null/undefined values
        const pairs = [];
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
            if (x[i] !== null && x[i] !== undefined && !isNaN(x[i]) &&
                y[i] !== null && y[i] !== undefined && !isNaN(y[i])) {
                pairs.push([x[i], y[i]]);
            }
        }

        if (pairs.length < 3) {
            return { r: 0, pValue: 1, n: pairs.length };
        }

        const n = pairs.length;
        const xArr = pairs.map(p => p[0]);
        const yArr = pairs.map(p => p[1]);

        const xMean = this.mean(xArr);
        const yMean = this.mean(yArr);

        let numerator = 0;
        let xDenom = 0;
        let yDenom = 0;

        for (let i = 0; i < n; i++) {
            const xDiff = xArr[i] - xMean;
            const yDiff = yArr[i] - yMean;
            numerator += xDiff * yDiff;
            xDenom += xDiff * xDiff;
            yDenom += yDiff * yDiff;
        }

        const r = numerator / Math.sqrt(xDenom * yDenom);

        // Calculate p-value using t-distribution approximation
        const t = r * Math.sqrt((n - 2) / (1 - r * r));
        const pValue = this.tDistributionPValue(Math.abs(t), n - 2);

        return { r: isNaN(r) ? 0 : r, pValue, n };
    },

    /**
     * Simple linear regression: y = mx + b
     * @param {Array<number>} x - independent variable
     * @param {Array<number>} y - dependent variable
     * @returns {Object} { slope, intercept, r2, predict }
     */
    linearRegression(x, y) {
        // Filter out pairs with null/undefined values
        const pairs = [];
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
            if (x[i] !== null && x[i] !== undefined && !isNaN(x[i]) &&
                y[i] !== null && y[i] !== undefined && !isNaN(y[i])) {
                pairs.push([x[i], y[i]]);
            }
        }

        if (pairs.length < 2) {
            return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };
        }

        const n = pairs.length;
        const xArr = pairs.map(p => p[0]);
        const yArr = pairs.map(p => p[1]);

        const xMean = this.mean(xArr);
        const yMean = this.mean(yArr);

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            numerator += (xArr[i] - xMean) * (yArr[i] - yMean);
            denominator += (xArr[i] - xMean) * (xArr[i] - xMean);
        }

        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = yMean - slope * xMean;

        // Calculate R² (coefficient of determination)
        let ssRes = 0;
        let ssTot = 0;
        for (let i = 0; i < n; i++) {
            const predicted = slope * xArr[i] + intercept;
            ssRes += (yArr[i] - predicted) ** 2;
            ssTot += (yArr[i] - yMean) ** 2;
        }
        const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

        return {
            slope,
            intercept,
            r2,
            predict: (xVal) => slope * xVal + intercept
        };
    },

    /**
     * Independent samples t-test
     * @param {Array<number>} group1
     * @param {Array<number>} group2
     * @returns {Object} { t, pValue, df, mean1, mean2, diff }
     */
    independentTTest(group1, group2) {
        const g1 = group1.filter(x => x !== null && x !== undefined && !isNaN(x));
        const g2 = group2.filter(x => x !== null && x !== undefined && !isNaN(x));

        const n1 = g1.length;
        const n2 = g2.length;

        if (n1 < 2 || n2 < 2) {
            return { t: 0, pValue: 1, df: 0, mean1: 0, mean2: 0, diff: 0 };
        }

        const mean1 = this.mean(g1);
        const mean2 = this.mean(g2);
        const var1 = this.variance(g1);
        const var2 = this.variance(g2);

        // Pooled variance (assuming equal variances)
        const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
        const standardError = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

        const t = (mean1 - mean2) / standardError;
        const df = n1 + n2 - 2;
        const pValue = this.tDistributionPValue(Math.abs(t), df);

        return {
            t: isNaN(t) ? 0 : t,
            pValue,
            df,
            mean1,
            mean2,
            diff: mean1 - mean2
        };
    },

    /**
     * Paired samples t-test (for before/after comparisons)
     * @param {Array<number>} before
     * @param {Array<number>} after
     * @returns {Object} { t, pValue, df, meanDiff }
     */
    pairedTTest(before, after) {
        const diffs = [];
        for (let i = 0; i < Math.min(before.length, after.length); i++) {
            if (before[i] !== null && after[i] !== null) {
                diffs.push(after[i] - before[i]);
            }
        }

        if (diffs.length < 2) {
            return { t: 0, pValue: 1, df: 0, meanDiff: 0 };
        }

        const meanDiff = this.mean(diffs);
        const stdDiff = this.std(diffs);
        const n = diffs.length;

        const t = meanDiff / (stdDiff / Math.sqrt(n));
        const df = n - 1;
        const pValue = this.tDistributionPValue(Math.abs(t), df);

        return {
            t: isNaN(t) ? 0 : t,
            pValue,
            df,
            meanDiff
        };
    },

    /**
     * Calculate variance
     * @param {Array<number>} arr
     * @returns {number}
     */
    variance(arr) {
        const std = this.std(arr);
        return std * std;
    },

    /**
     * Approximate p-value from t-distribution
     * Using approximation for simplicity (would need full t-distribution for exact)
     * @param {number} t - t statistic (absolute value)
     * @param {number} df - degrees of freedom
     * @returns {number} two-tailed p-value
     */
    tDistributionPValue(t, df) {
        // Using approximation from Abramowitz & Stegun
        // For large df, t-distribution approaches normal
        if (df <= 0) return 1;

        const x = df / (df + t * t);
        const a = df / 2;
        const b = 0.5;

        // Incomplete beta function approximation
        // For small df, use lookup thresholds
        if (df >= 100) {
            // Use normal approximation
            return 2 * (1 - this.normalCDF(Math.abs(t)));
        }

        // Simplified approximation using incomplete beta
        // This is approximate but sufficient for dashboard purposes
        const bt = Math.exp(
            this.lnGamma(a + b) - this.lnGamma(a) - this.lnGamma(b) +
            a * Math.log(x) + b * Math.log(1 - x)
        );

        let pValue;
        if (x < (a + 1) / (a + b + 2)) {
            pValue = bt * this.betaCF(x, a, b) / a;
        } else {
            pValue = 1 - bt * this.betaCF(1 - x, b, a) / b;
        }

        return Math.max(0, Math.min(1, pValue));
    },

    /**
     * Normal CDF approximation
     * @param {number} x
     * @returns {number}
     */
    normalCDF(x) {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return 0.5 * (1.0 + sign * y);
    },

    /**
     * Log gamma function (Lanczos approximation)
     * @param {number} x
     * @returns {number}
     */
    lnGamma(x) {
        const cof = [
            76.18009172947146, -86.50532032941677,
            24.01409824083091, -1.231739572450155,
            0.1208650973866179e-2, -0.5395239384953e-5
        ];

        let y = x;
        let tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;

        for (let j = 0; j < 6; j++) {
            ser += cof[j] / ++y;
        }

        return -tmp + Math.log(2.5066282746310005 * ser / x);
    },

    /**
     * Continued fraction for incomplete beta function
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    betaCF(x, a, b) {
        const maxIterations = 100;
        const epsilon = 3e-7;

        const qab = a + b;
        const qap = a + 1;
        const qam = a - 1;
        let c = 1;
        let d = 1 - qab * x / qap;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        d = 1 / d;
        let h = d;

        for (let m = 1; m <= maxIterations; m++) {
            const m2 = 2 * m;
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            h *= d * c;

            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            const del = d * c;
            h *= del;

            if (Math.abs(del - 1) < epsilon) break;
        }

        return h;
    },

    /**
     * Format p-value for display
     * @param {number} p
     * @returns {string}
     */
    formatPValue(p) {
        if (p < 0.001) return '< 0.001';
        if (p < 0.01) return p.toFixed(3);
        if (p < 0.05) return p.toFixed(3);
        return p.toFixed(2);
    },

    /**
     * Check if result is significant
     * @param {number} p
     * @param {number} alpha (default 0.05)
     * @returns {boolean}
     */
    isSignificant(p, alpha = 0.05) {
        return p < alpha;
    },

    /**
     * Format significance indicator
     * @param {number} p
     * @returns {string}
     */
    significanceIndicator(p) {
        if (p < 0.001) return '★★★';
        if (p < 0.01) return '★★';
        if (p < 0.05) return '★';
        return 'ns';
    }
};
