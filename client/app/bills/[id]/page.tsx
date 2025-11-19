"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchBillById } from "@/lib/redux/slices/billSlice";
import type { Bill } from "@/lib/redux/slices/billSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";

// Bill Template Component
function BillTemplate({ data }: { data: Bill }) {
  // Helper function to safely format numbers
  const fmt = (value: string | number | null | undefined): string => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const billDate = new Date(data.month);
  const monthName = billDate.toLocaleString("default", { month: "long" });
  const year = billDate.getFullYear();
  const formattedDate = `${String(billDate.getDate()).padStart(2, "0")}-${String(billDate.getMonth() + 1).padStart(2, "0")}-${billDate.getFullYear().toString().slice(-2)}`;
  
  // Calculate previous readings (current - consumption)
  const prevElectricityReading = data.electricityImportReading - data.electricityConsumption;
  const prevWaterReading = data.waterReading - data.waterConsumption;

  return (
    <div className="bg-white border border-gray-400 font-mono text-[10px] leading-[1.3] w-full px-4 py-3 print:border-0">
      {/* Header Section */}
      <div className="flex justify-between mb-0">
        {/* Left Column - Electricity Bill */}
        <div className="w-[49%]">
          <div>ESSENTIAL SERVICES, GENERAL & ACCTG. OFFICE</div>
          <div className="ml-16">DAYALBAGH, AGRA, 282 005</div>
          <div>Con. Code: {data.house.consumerCode}   Dept: {data.house.department || "ABR"}</div>
          <div>Mr/Ms/Mrs: {data.house.licenseeName}</div>
          <div></div>
          <div className="ml-8">{data.house.mohalla.number} {data.house.houseNumber}</div>
          <div className="ml-8">Dayalbagh, Agra-282005</div>
          <div>Memo No.E/{data.house.houseNumber}   Dated: {formattedDate}</div>
          <div>For the month of {monthName} {year}</div>
        </div>

        {/* Right Column - Water Bill */}
        <div className="w-[49%] pl-20">
          <div>RDS ESSENTIAL SERVICES</div>
          <div>GENERAL & ACCOUNTING OFFICE, DAYALBAGH</div>
          <div>Con. Code: {data.house.consumerCode}   Dept: {data.house.department || "ABR"}</div>
          <div>Mr/Ms/Mrs: {data.house.licenseeName}</div>
          <div></div>
          <div className="ml-8">{data.house.mohalla.number} {data.house.houseNumber}</div>
          <div className="ml-8">Dayalbagh, Agra-282005</div>
          <div>Memo No.O/{data.house.houseNumber}   Dated: {formattedDate}</div>
          <div>For the month of {monthName} {year}</div>
        </div>
      </div>

      {/* Notice */}
      <div className="my-0">
        <div>Note:Electricity/Water Supply will be disconnected if due amount is not paid within 2 months of due date</div>
      </div>

      {/* Dashed separator */}
      <div className="my-0">
        <div>--------------------------------------------------------------------------------------------------------</div>
      </div>

      {/* Table Header */}
      <div className="flex">
        <div className="w-[5%]">Meter</div>
        <div className="w-[8%]">Present</div>
        <div className="w-[6%]">Last</div>
        <div className="w-[3%]">MF</div>
        <div className="w-[7%] pr-1">Units</div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Particulars</div>
        <div className="w-[8%]">Amount</div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">Particulars</div>
        <div className="w-[8%]">Amount</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[5%]">No.</div>
        <div className="w-[8%]">Reading</div>
        <div className="w-[6%]">Reading</div>
        <div className="w-[3%]"></div>
        <div className="w-[7%] pr-1">Consumed</div>
        <div className="pr-1"></div>
        <div className="w-[15%]">         of charges</div>
        <div className="w-[8%]">         Rs.</div>
        <div className="pl-1"></div>
        <div className="w-[15%]">         of charges</div>
        <div className="w-[8%]">         Rs.</div>
        <div className="flex-1"></div>
      </div>

      {/* Dashed separator */}
      <div className="my-0">
        <div>-------------------------------------------------------------------------------------------------------------------------------------------</div>
      </div>

      {/* Electricity Consumption */}
      <div className="flex">
        <div className="w-[29%]">Electricity Consumption</div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[5%]">{data.house.houseNumber}</div>
        <div className="w-[8%]">{data.electricityImportReading}</div>
        <div className="w-[6%]">{prevElectricityReading}</div>
        <div className="w-[3%]">1</div>
        <div className="w-[7%] pr-1">{data.electricityBilledEnergy}</div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Recovery of</div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Fixed Chgs</div>
        <div className="w-[8%] pl-1">{fmt(data.fixedCharge)}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">License Fee</div>
        <div className="w-[8%] pl-1">{fmt(data.house.licenseFee)}</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Recovery of</div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Elect. Chgs</div>
        <div className="w-[8%] pl-1">{fmt(data.electricityCharge)}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Recovery of</div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">Residence Fee</div>
        <div className="w-[8%] pl-1">{fmt(data.house.residenceFee)}</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1">Elect. Duty</div>
        <div className="w-[8%] pl-1">{fmt(data.electricityDuty)}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">Other Charges</div>
        <div className="w-[8%] pl-1">{data.otherCharges > 0 ? fmt(data.otherCharges) : ""}</div>
        <div className="flex-1"></div>
      </div>

      {/* Water Consumption */}
      <div className="flex">
        <div className="w-[29%]">Water Consumption (in K.L.)</div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">Maint. Charges</div>
        <div className="w-[8%] pl-1">{fmt(data.maintenanceCharge)}</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[5%]">{data.house.houseNumber}</div>
        <div className="w-[8%]">{data.waterReading}</div>
        <div className="w-[6%]">{prevWaterReading}</div>
        <div className="w-[3%]">1</div>
        <div className="w-[7%] pr-1">{data.waterConsumption}</div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">A)W.Arrear</div>
        <div className="w-[8%] pl-1">{data.bill2Arrear > 0 ? fmt(data.bill2Arrear) : ""}</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">B)W.Meter Cost</div>
        <div className="w-[8%] pl-1"></div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">C)W.Charges</div>
        <div className="w-[8%] pl-1">{fmt(data.waterCharge)}</div>
        <div className="flex-1"></div>
      </div>

      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%] pl-1"></div>
        <div className="w-[8%] pl-1"></div>
        <div className="pl-1">:</div>
        <div className="w-[15%] pl-1">Recovery(A+B+C)</div>
        <div className="w-[8%] pl-1">{fmt(data.waterCharge + data.bill2Arrear)}</div>
        <div className="flex-1"></div>
      </div>

      {/* Dashed separator */}
      <div className="my-0">
        <div>-------------------------------------------------------------------------------------------------------------------------------------------</div>
      </div>

      {/* Payment Details */}
      <div className="flex">
        <div className="w-[29%]"></div>
        <div className="pr-1">:</div>
        <div className="w-[15%]">         Arr/Refd(-)</div>
        <div className="w-[8%]">{data.bill1Arrear > 0 ? fmt(data.bill1Arrear) : ""}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%]">         Arr/Refd(-)</div>
        <div className="w-[8%]">{data.bill2Arrear > 0 ? fmt(data.bill2Arrear) : ""}</div>
        <div className="flex-1">Pay</div>
      </div>

      <div className="flex">
        <div className="w-[29%]">Payable: From 1st-15th</div>
        <div className="pr-1">:</div>
        <div className="w-[15%]">         Due Amount</div>
        <div className="w-[8%]">         {fmt(data.bill1Upto15)}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%]">         Due Amount</div>
        <div className="w-[8%]">         {fmt(data.bill2Upto15)}</div>
        <div className="flex-1">{fmt(data.totalBillUpto15)} upto 15th</div>
      </div>

      <div className="flex">
        <div className="w-[29%]">From 16th-27th with 1.5% surcharge</div>
        <div className="pr-1">:</div>
        <div className="w-[15%]">         </div>
        <div className="w-[8%]">         {fmt(data.bill1After15)}</div>
        <div className="pl-1">:</div>
        <div className="w-[15%]">         </div>
        <div className="w-[8%]">         {fmt(data.bill2After15)}</div>
        <div className="flex-1">{fmt(data.totalBillAfter15)} from 16th-27th</div>
      </div>

      {/* Dashed separator */}
      <div className="my-0">
        <div>-------------------------------------------------------------------------------------------------------------------------------------------</div>
      </div>

      {/* Bank Section */}
      <div className="flex">
        <div className="w-[29%]">FOR BANK USE</div>
        <div className="pr-1">:</div>
        <div className="w-[15%]"></div>
        <div className="w-[8%]"></div>
        <div className="pl-1">:</div>
        <div className="pl-1">By Cash/Cheque No.:</div>
      </div>

      {/* Footer */}
      <div className="text-center tracking-[0.5em] mt-2 mb-2">
        * * *   S  A  V  E   E  L  E  C  T  R  I  C  I  T  Y   * * *
      </div>
    </div>
  );
}

// Main Page Component
export default function BillDetailPage() {
  const params = useParams();
  const billId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useAppDispatch();
  const { currentBill, loading, error } = useAppSelector((state) => state.bill);

  useEffect(() => {
    if (billId) {
      dispatch(fetchBillById(billId));
    }
  }, [billId, dispatch]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    alert("PDF download will be implemented soon");
  };

  // Helper function to safely format numbers
  const formatAmount = (value: string | number | null | undefined): string => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !currentBill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
              <Link href="/bills">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Bills
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Bill not found"}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
              <p className="text-sm text-gray-600">
                {currentBill.house.licenseeName} - {currentBill.house.houseNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Link href="/bills">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        <div ref={printRef} className="print:shadow-none">
          <BillTemplate data={currentBill} />
        </div>

        {/* Bill Summary - Hidden when printing */}
        <Card className="mt-6 print:hidden">
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-lg">{currentBill.billStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount (Up to 15th)</p>
                <p className="font-semibold text-lg">₹{formatAmount(currentBill.totalBillUpto15)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount (After 15th)</p>
                <p className="font-semibold text-lg">₹{formatAmount(currentBill.totalBillAfter15)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="font-semibold text-lg">
                  {currentBill.paidAmount ? `₹${formatAmount(currentBill.paidAmount)}` : "Not Paid"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
