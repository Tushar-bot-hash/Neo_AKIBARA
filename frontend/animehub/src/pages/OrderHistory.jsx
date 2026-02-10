import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronDown, ChevronUp, Calendar, CreditCard, Box, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
// FIX 1: Import your centralized API service
import api from "@/services/api"; 

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // FIX 2: Use the api service instead of a hardcoded localhost fetch
        // The service automatically attaches your Bearer token and uses the correct Render URL
        const response = await api.get('/orders');
        const result = response.data;
        
        if (result.success) setOrders(result.data);
      } catch (err) {
        console.error("Failed to retrieve archives:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleManifest = (id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeAllManifests = () => setExpandedOrders({});

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-12 w-12 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center font-mono text-[#00f0ff] tracking-widest uppercase animate-pulse">
        SCANNING_DATABASE...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">
          Transaction <span className="text-[#ff0055]">Archives</span>
        </h1>
        {Object.values(expandedOrders).some(v => v) && (
          <Button 
            variant="ghost" 
            onClick={closeAllManifests}
            className="text-[10px] font-mono text-gray-500 hover:text-[#ff0055] uppercase tracking-widest"
          >
            Collapse All
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center border border-dashed border-gray-800 p-20 bg-gray-900/20 rounded-2xl">
          <Package className="h-16 w-16 mx-auto text-gray-800 mb-4" />
          <p className="font-mono text-gray-500">NO PREVIOUS DATA DETECTED IN THIS SECTOR.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="bg-gray-900/40 border-gray-800 hover:border-[#00f0ff]/30 transition-all overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="p-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-transparent to-gray-900/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.2em]">ID_REF:</span>
                      <span className="font-mono text-sm text-[#00f0ff] font-bold">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <Badge className={
                        order.status === 'completed' || order.status === 'processing' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-[10px] font-mono uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {order.payment_method || "STRIPE"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">Total Credits</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">
                      ${order.total_amount ? order.total_amount.toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>

                {/* Toggle Bar */}
                <div 
                  onClick={() => toggleManifest(order._id)}
                  className={`border-t border-b border-gray-800 p-3 px-6 flex justify-between items-center cursor-pointer transition-colors ${
                    expandedOrders[order._id] ? 'bg-[#ff0055]/10' : 'bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className={`h-3 w-3 ${expandedOrders[order._id] ? 'text-[#ff0055]' : 'text-gray-600'}`} />
                    <span className={`text-[10px] font-black uppercase italic tracking-widest ${expandedOrders[order._id] ? 'text-white' : 'text-gray-400'}`}>
                      {expandedOrders[order._id] ? 'CLOSE_MANIFEST' : 'VIEW_FULL_MANIFEST'}
                    </span>
                  </div>
                  {expandedOrders[order._id] ? <ChevronUp className="h-4 w-4 text-[#ff0055]" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
                </div>

                {/* Manifest Content */}
                {expandedOrders[order._id] && (
                  <div className="p-6 bg-black/30 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Items */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest border-b border-gray-800 pb-2">Payload_Contents</p>
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center text-[10px] font-mono text-gray-500">
                                 {idx + 1}
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-gray-200 group-hover:text-[#00f0ff] transition-colors">
                                   {item.product_name}
                                 </p>
                                 <p className="text-[10px] font-mono text-gray-500">UNIT_QTY: {item.quantity}</p>
                               </div>
                            </div>
                            <p className="text-sm font-mono text-white">${item.price ? item.price.toFixed(2) : "0.00"}</p>
                          </div>
                        ))}
                      </div>

                      {/* Delivery and Data */}
                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-mono text-[#ff0055] uppercase tracking-widest mb-3">Delivery_Node</p>
                            <div className="bg-gray-900/50 p-4 rounded border border-gray-800 font-mono">
                               <p className="text-xs text-gray-400 leading-relaxed uppercase">
                                 ADDR // {order.shipping_address?.street || "N/A"}<br />
                                 CITY // {order.shipping_address?.city || "N/A"}<br />
                                 ZIP_ // {order.shipping_address?.zip || "N/A"}
                               </p>
                            </div>
                         </div>
                         
                         <div className="opacity-40 hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-mono text-gray-600 uppercase mb-1">Transaction_Hash</p>
                            <p className="text-[9px] font-mono text-gray-700 truncate">{order.payment_session_id || "LOCAL_TRANS_001"}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}