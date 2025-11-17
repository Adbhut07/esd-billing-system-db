"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const electricity_routes_1 = __importDefault(require("./routes/electricity.routes"));
const water_routes_1 = __importDefault(require("./routes/water.routes"));
const bill_routes_1 = __importDefault(require("./routes/bill.routes"));
const house_routes_1 = __importDefault(require("./routes/house.routes"));
const mohalla_routes_1 = __importDefault(require("./routes/mohalla.routes"));
const charges_routes_1 = __importDefault(require("./routes/charges.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/electricity', electricity_routes_1.default);
app.use('/api/water', water_routes_1.default);
app.use('/api/bills', bill_routes_1.default);
app.use('/api/houses', house_routes_1.default);
app.use('/api/mohallas', mohalla_routes_1.default);
app.use('/api/charges', charges_routes_1.default);
// Start server
app.listen(port, () => {
    console.log(`⚡️ Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map