import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronDown, ChevronUp, Calendar, CreditCard, LayoutGrid, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api"; 

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        // result.data contains the array of orders based on your backend controller
        if (response.data?.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error("CRITICAL_DATABASE_ACCESS_DENIED:", err);
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
      {/* Header */}
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
          <p className="font-mono text-gray-500 uppercase">No data packets found in this sector.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="bg-gray-900/40 border-gray-800 hover:border-[#00f0ff]/30 transition-all overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                {/* Order Summary Header */}
                <div className="p-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-transparent to-gray-900/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.2em]">ID_REF:</span>
                      <span className="font-mono text-sm text-[#00f0ff] font-bold">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <Badge className={
                        order.status === 'completed' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-[10px] font-mono uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {order.payment_method || "CREDIT_LINE"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">Total Credits</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>

                {/* Interaction Bar */}
                <div 
                  onClick={() => toggleManifest(order._id)}
                  className={`border-t border-b border-gray-800 p-3 px-6 flex justify-between items-center cursor-pointer transition-colors ${
                    expandedOrders[order._id] ? 'bg-[#ff0055]/10' : 'bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className={`h-3 w-3 ${expandedOrders[order._id] ? 'text-[#ff0055]' : 'text-gray-600'}`} />
                    <span className={`text-[10px] font-black uppercase italic tracking-widest ${expandedOrders[order._id] ? 'text-white' : 'text-gray-400'}`}>
                      {expandedOrders[order._id] ? 'DECRYPT_MANIFEST' : 'VIEW_FULL_MANIFEST'}
                    </span>
                  </div>
                  {expandedOrders[order._id] ? <ChevronUp className="h-4 w-4 text-[#ff0055]" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
                </div>

                {/* Expanded Details */}
                {expandedOrders[order._id] && (
                  <div className="p-6 bg-black/30 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      
                      {/* Product Manifest */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest border-b border-gray-800 pb-2">Payload_Contents</p>
                        
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group bg-black/40 p-3 rounded-lg border border-gray-800 hover:border-[#00f0ff]/40 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-900 border border-gray-800 group-hover:border-[#00f0ff]/50">
                                  <img 
                                    src={item.image_url || "/api/placeholder/64/64"} 
                                    alt={item.product_name}
                                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/64?text=NA" }}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-200 group-hover:text-[#00f0ff] uppercase">
                                    {item.product_name}
                                  </p>
                                  <p className="text-[10px] font-mono text-gray-500 uppercase">Unit_Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-sm font-mono text-white tracking-tighter">${item.price?.toFixed(2)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 font-mono text-[10px] italic py-4">
                            <AlertCircle className="h-3 w-3" /> DATA_CORRUPTED: NO_ITEM_METADATA_LOCATED
                          </div>
                        )}
                      </div>

                      {/* Logistics Node */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-mono text-[#ff0055] uppercase tracking-widest mb-3">Delivery_Node</p>
                          <div className="bg-gray-900/50 p-4 rounded border border-gray-800 font-mono">
                            <p className="text-xs text-gray-400 leading-relaxed uppercase">
                              NAME // {order.user_name}<br />
                              ADDR // {order.shipping_address?.street || "Digital Access Only"}<br />
                              CITY // {order.shipping_address?.city || "Sector 7"}<br />
                              AUTH // {order.user_email}
                            </p>
                          </div>
                        </div>
                        <div className="opacity-30 hover:opacity-100 transition-opacity duration-500">
                          <p className="text-[9px] font-mono text-gray-600 uppercase mb-1">Stripe_Session_Hash</p>
                          <p className="text-[9px] font-mono text-gray-700 break-all">{order.payment_session_id || "OFFLINE_TRANS"}</p>
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