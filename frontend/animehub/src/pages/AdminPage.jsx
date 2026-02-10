import { useState, useEffect } from 'react';
import { 
  Package, Users, ShoppingBag, BarChart, Plus, Edit, Trash2, 
  RefreshCw, Shield, X, Check, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// FIX 1: Use your centralized API service
import api from "@/services/api"; 

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'figures',
    image_url: '',
    stock: '',
    featured: false,
    discount: 0,
    tags: ''
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (error) {
      toast({ 
        title: "Sync Error", 
        description: "Failed to connect to the Matrix.", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        discount: parseInt(productForm.discount),
        tags: typeof productForm.tags === 'string' 
          ? productForm.tags.split(',').map(t => t.trim()) 
          : productForm.tags
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast({ title: "Artifact Updated", description: "Changes saved to the mainframe." });
      } else {
        await api.post('/products', payload);
        toast({ title: "Artifact Uploaded", description: "New gear added to the catalog." });
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast({ 
        title: "Transmission Failed", 
        description: err.response?.data?.message || "Operation failed.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("NEURAL OVERRIDE: Are you sure you want to delete this artifact?")) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast({ title: "Artifact Purged", description: "Item removed from inventory." });
      fetchData();
    } catch (err) {
      toast({ title: "Purge Failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'figures', image_url: '', stock: '', featured: false, discount: 0, tags: '' });
    setEditingId(null);
  };

  if (user?.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <Shield className="h-20 w-20 text-[#ff0055] mx-auto animate-pulse" />
        <h1 className="text-2xl font-black text-white tracking-widest uppercase">ACCESS_DENIED</h1>
        <p className="text-gray-500 font-mono text-sm">ADMIN PRIVILEGES REQUIRED FOR THIS SECTOR.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-[#ff0055]">DASHBOARD</h1>
            <p className="text-gray-400 font-mono text-sm">Welcome back, {user.name}.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#00f0ff] text-black font-bold hover:bg-[#00f0ff]/80">
            <Plus className="mr-2 h-4 w-4" /> ADD PRODUCT
          </Button>
        </div>

        {/* Product Table */}
        <Card className="bg-[#0a0a0c] border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent bg-white/5">
                <TableHead className="text-gray-400">PRODUCT</TableHead>
                <TableHead className="text-gray-400">CATEGORY</TableHead>
                <TableHead className="text-gray-400">STOCK</TableHead>
                <TableHead className="text-gray-400 text-right">PRICE</TableHead>
                <TableHead className="text-gray-400 text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id} className="border-gray-800 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium flex items-center gap-4">
                    <img src={p.image_url} className="w-12 h-12 rounded border border-gray-700 object-cover bg-gray-900" />
                    <div>
                      <div className="text-white font-bold">{p.name}</div>
                      {p.featured && <Badge className="bg-[#ff0055] text-[9px] h-4 px-1">FEATURED</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-gray-400 font-mono text-xs">{p.category}</TableCell>
                  <TableCell>
                    <span className={p.stock < 10 ? "text-red-500 font-bold" : "text-[#00f0ff] font-mono"}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#00f0ff]">${p.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(p._id); setProductForm({...p, tags: p.tags.join(', ')}); setShowModal(true); }} className="hover:text-[#00f0ff]">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)} className="hover:text-[#ff0055]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[#0a0a0c] border-[#00f0ff] border-t-4 my-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-white uppercase italic">
                  {editingId ? 'Modify_Artifact' : 'Upload_New_Artifact'}
                </CardTitle>
                <CardDescription className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                  Gear registry synchronization
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="h-6 w-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form content remains same as your snippet... */}
              <div className="grid grid-cols-2 gap-4">
                 {/* Product Name & Category */}
                 <div className="space-y-2">
                   <Label className="text-white font-bold text-xs uppercase">Product Name</Label>
                   <Input required className="bg-black border-gray-800 text-white" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-white font-bold text-xs uppercase">Category</Label>
                   <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                     <SelectTrigger className="bg-black border-gray-800"><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-black border-gray-800 text-white">
                       <SelectItem value="figures">Figures & Collectibles</SelectItem>
                       <SelectItem value="apparel">Apparel</SelectItem>
                       <SelectItem value="art">Art & Media</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold text-xs uppercase">Description</Label>
                <Textarea required className="bg-black border-gray-800 min-h-[80px]" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold text-xs uppercase">Price ($)</Label>
                  <Input type="number" step="0.01" required className="bg-black border-gray-800" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold text-xs uppercase">Stock</Label>
                  <Input type="number" required className="bg-black border-gray-800" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold text-xs uppercase">Discount (%)</Label>
                  <Input type="number" className="bg-black border-gray-800" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-bold text-xs uppercase">Image URL</Label>
                <Input required className="bg-black border-gray-800" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="featured" checked={productForm.featured} onCheckedChange={(checked) => setProductForm({...productForm, featured: checked})} className="border-[#00f0ff] data-[state=checked]:bg-[#00f0ff]" />
                <Label htmlFor="featured" className="text-white cursor-pointer font-bold text-xs uppercase">Featured Highlight</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 border-gray-800 text-white">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#00f0ff] text-black font-bold">
                  {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : editingId ? 'SYNCHRONIZE' : 'UPLINK'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;