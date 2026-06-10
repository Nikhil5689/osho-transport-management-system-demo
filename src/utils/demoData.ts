import { Client, Booking, Payment, CompanySettings } from '../store/useStore';

// Realistic list of client templates for Chhattisgarh transport system
const CLIENT_TEMPLATES = [
  { name: 'Tata Steel Raipur', gst: '22AAAAA1234A1Z1', phone: '9876543210', address: 'Industrial Area Phase 2, Raipur', city: 'Raipur' },
  { name: 'Jindal Steel & Power', gst: '22BBBBB5678B1Z2', phone: '9812345678', address: 'Mandir Hasaud, Raipur', city: 'Raigarh' },
  { name: 'Century Cement Baikunth', gst: '22CCCCC9012C1Z3', phone: '9765432109', address: 'Baikunth Industrial Complex, Raipur', city: 'Baikunth' },
  { name: 'Chhattisgarh Coal Traders', gst: '22DDDDD3456D1Z4', phone: '9988776655', address: 'Ring Road No. 2, Bilaspur', city: 'Bilaspur' },
  { name: 'Sarda Energy & Minerals Ltd', gst: '22EEEEE7890E1Z5', phone: '9654321077', address: 'Siltara Industrial Area, Raipur', city: 'Raipur' },
  { name: 'Raipur Sponge Iron Corp', gst: '22FFFFF2468F1Z6', phone: '9543210988', address: 'Urla Industrial Estate, Raipur', city: 'Raipur' },
  { name: 'Bhilai Steel Works', gst: '22GGGGG1357G1Z7', phone: '9432109877', address: 'Bhilai Sector 1, Durg', city: 'Bhilai' },
  { name: 'Adani Power Korba', gst: '22HHHHH4321H1Z8', phone: '9321098765', address: 'Urjanagar, Korba', city: 'Korba' },
  { name: 'Vandana Global Raipur', gst: '22IIIII8765I1Z9', phone: '9210987654', address: 'Siltara Phase II, Raipur', city: 'Raipur' }
];

const ROUTES = [
  { origin: 'Raipur', destination: 'Bilaspur' },
  { origin: 'Raipur', destination: 'Raigarh' },
  { origin: 'Bhilai', destination: 'Nagpur' },
  { origin: 'Durg', destination: 'Bilaspur' },
  { origin: 'Raigarh', destination: 'Kolkata' },
  { origin: 'Korba', destination: 'Raipur' },
  { origin: 'Raipur', destination: 'Korba' },
  { origin: 'Bilaspur', destination: 'Raigarh' }
];

const MATERIALS = [
  { name: 'TMT Steel Rods', packing: 'Bundles', packSize: [50, 100, 150, 200] },
  { name: 'OPC Cement 43 Grade', packing: 'Bags', packSize: [200, 300, 400, 500] },
  { name: 'Coal Slurry', packing: 'Loose', packSize: [1, 1, 1] },
  { name: 'Heavy Machinery Parts', packing: 'Wooden Crates', packSize: [2, 4, 6, 8] },
  { name: 'Aluminium Ingots', packing: 'Bundles', packSize: [40, 80, 120] },
  { name: 'Iron Ore Pellets', packing: 'Loose', packSize: [1, 1, 1] },
  { name: 'Fly Ash Brick Pallets', packing: 'Pallets', packSize: [10, 20, 30] }
];

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'OSHO Transport Chhattisgarh',
  address: 'Transport Nagar, Raipur',
  city: 'Raipur',
  state: 'Chhattisgarh',
  phone: '9876543210',
  phone2: '9876543211',
  gst: '22AAAAA0000A1Z5',
  prefix: 'OSHO-',
  startingNumber: 1001,
  defaultFreight: 0,
  defaultHamali: 0,
  defaultDocket: 50,
  terms: 'Goods once booked will not be returned. Company not responsible for leakage or breakage. All disputes subject to Raipur jurisdiction.',
};

export function generateRealisticDemoData() {
  const clients: Client[] = CLIENT_TEMPLATES.map((t, idx) => ({
    id: `client_${idx + 1}`,
    name: t.name,
    gst: t.gst,
    phone: t.phone,
    address: t.address,
    city: t.city,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months ago
  }));

  const bookings: Booking[] = [];
  const payments: Payment[] = [];

  // Generate 25 bookings distributed over the last 6 months
  const now = new Date();
  let wayBillCounter = 1001;

  for (let i = 24; i >= 0; i--) {
    // Booking Date: spaced over the last 150 days
    const bookingDateObj = new Date(now.getTime() - i * 6 * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
    const bookingDateStr = bookingDateObj.toISOString().slice(0, 10); // YYYY-MM-DD
    const createdAtStr = bookingDateObj.toISOString();

    // Select random consignor and consignee (guarantee they are different)
    const consignorIdx = Math.floor(Math.random() * clients.length);
    let consigneeIdx = Math.floor(Math.random() * clients.length);
    if (consigneeIdx === consignorIdx) {
      consigneeIdx = (consignorIdx + 1) % clients.length;
    }
    const consignor = clients[consignorIdx];
    const consignee = clients[consigneeIdx];

    // Select random route and material
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    const materialObj = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    const packages = materialObj.packSize[Math.floor(Math.random() * materialObj.packSize.length)];
    
    // Weight calculation
    let actualWeight = 10 + Math.random() * 25; // 10 to 35 tons
    if (materialObj.name.includes('Machinery')) {
      actualWeight = 5 + Math.random() * 10;
    }
    actualWeight = Math.round(actualWeight * 10) / 10;
    const chargeWeight = Math.ceil(actualWeight);

    // Charges calculation
    const freightRate = 1200 + Math.floor(Math.random() * 600); // 1200 - 1800 per ton
    const freight = chargeWeight * freightRate;
    const hamali = materialObj.packing === 'Loose' ? 0 : packages * 12;
    const docket = 50;
    const doorCollection = Math.random() > 0.6 ? 500 : 0;
    const other = Math.random() > 0.8 ? 200 : 0;
    const totalFreight = freight + hamali + docket + doorCollection + other;

    // Payment Mode
    const paymentModeOptions: Array<'toPay' | 'paid' | 'tBB'> = ['toPay', 'paid', 'tBB'];
    const paymentMode = paymentModeOptions[Math.floor(Math.random() * paymentModeOptions.length)];

    // Delivery Status (older are delivered, newer are pending or in-transit)
    let status: 'pending' | 'in_transit' | 'delivered' = 'delivered';
    if (i <= 2) {
      status = Math.random() > 0.5 ? 'in_transit' : 'pending';
    } else if (i <= 4) {
      status = 'delivered';
    }

    // Payment Status and Amount Paid
    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'paid';
    let amountPaid = 0;

    if (status === 'pending') {
      paymentStatus = 'unpaid';
      amountPaid = 0;
    } else if (status === 'in_transit') {
      paymentStatus = Math.random() > 0.5 ? 'partial' : 'unpaid';
      amountPaid = paymentStatus === 'partial' ? Math.round((totalFreight * 0.4) / 100) * 100 : 0;
    } else {
      // Delivered
      const rand = Math.random();
      if (rand > 0.85) {
        paymentStatus = 'unpaid';
        amountPaid = 0;
      } else if (rand > 0.7) {
        paymentStatus = 'partial';
        amountPaid = Math.round((totalFreight * 0.5) / 100) * 100;
      } else {
        paymentStatus = 'paid';
        amountPaid = totalFreight;
      }
    }

    const bookingId = `booking_${bookingDateObj.getTime()}_${i}`;
    const wayBillNo = `OSHO-${wayBillCounter++}`;
    const invoiceNo = `${wayBillCounter - 1}/25-26`;
    const invoiceDate = bookingDateStr;

    const booking: Booking = {
      id: bookingId,
      wayBillNo,
      bookingDate: bookingDateStr,
      origin: route.origin,
      destination: route.destination,
      consignorId: consignor.id,
      consignorName: consignor.name,
      consignorPhone: consignor.phone,
      consignorAddress: consignor.address,
      consignorGst: consignor.gst,
      consigneeId: consignee.id,
      consigneeName: consignee.name,
      consigneePhone: consignee.phone,
      consigneeAddress: consignee.address,
      consigneeGst: consignee.gst,
      invoiceNo,
      invoiceDate,
      invoiceValue: (totalFreight * 10).toString(), // estimate
      material: materialObj.name,
      packages,
      packingType: materialObj.packing,
      actualWeight,
      chargeWeight,
      paymentMode,
      charges: {
        freight,
        hamali,
        docket,
        doorCollection,
        other,
        total: totalFreight
      },
      totalFreight,
      status,
      paymentStatus,
      amountPaid,
      notes: i % 5 === 0 ? 'Urgent delivery requested.' : 'Standard transit rules apply.',
      createdAt: createdAtStr
    };

    bookings.push(booking);

    // Payments generation matching the booking
    if (amountPaid > 0) {
      // Create payment
      const paymentDateObj = new Date(bookingDateObj.getTime() + (1 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000);
      const paymentDateStr = paymentDateObj.toISOString().slice(0, 10);
      const payModes = ['UPI', 'NEFT', 'Cash', 'Cheque'];
      const paymentModeSelected = payModes[Math.floor(Math.random() * payModes.length)];

      const payment: Payment = {
        id: `pay_${paymentDateObj.getTime()}_${i}`,
        bookingId: bookingId,
        wayBillNo: wayBillNo,
        clientName: consignor.name,
        amount: amountPaid,
        paymentDate: paymentDateStr,
        paymentMode: paymentModeSelected,
        notes: paymentStatus === 'paid' ? 'Full booking amount cleared.' : 'Advance payment received.',
        createdAt: paymentDateObj.toISOString()
      };

      payments.push(payment);
    }
  }

  // Sort bookings and payments newest first
  bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    clients,
    bookings,
    payments,
    settings: DEFAULT_SETTINGS
  };
}
