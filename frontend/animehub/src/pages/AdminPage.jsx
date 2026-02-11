import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, RefreshCw, Shield, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
    category: 'apparel', // Defaulted to apparel for your T-shirt test
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
      toast({ title: "Sync Error", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX: Robust payload to prevent 400 Bad Request
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0,
        discount: parseInt(productForm.discount) || 0,
        tags: productForm.tags 
          ? productForm.tags.split(',').map(t => t.trim()).filter(t => t !== "") 
          : []
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast({ title: "Artifact Updated" });
      } else {
        await api.post('/products', payload);
        toast({ title: "Artifact Uploaded" });
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      // Show the actual server error message to debug the 400 status
      const errorMsg = err.response?.data?.message || "Check network logs.";
      toast({ 
        title: "Transmission Failed", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("NEURAL OVERRIDE: Delete this artifact?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      toast({ title: "Purge Failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'apparel', image_url: '', stock: '', featured: false, discount: 0, tags: '' });
    setEditingId(null);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Shield className="h-20 w-20 text-[#ff0055] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-[#ff0055]">DASHBOARD</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#00f0ff] text-black">
            <Plus className="mr-2 h-4 w-4" /> ADD PRODUCT
          </Button>
        </div>

        {/* Product Table */}
        <Card className="bg-[#0a0a0c] border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead>PRODUCT</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>STOCK</TableHead>
                <TableHead className="text-right">PRICE</TableHead>
                <TableHead className="text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id} className="border-gray-800">
                  <TableCell className="flex items-center gap-4">
                    <img src={p.image_url} className="w-12 h-12 rounded object-cover" />
                    <div className="font-bold">{p.name}</div>
                  </TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-right">${p.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => { setEditingId(p._id); setProductForm({...p, tags: p.tags.join(', ')}); setShowModal(true); }}><Edit className="h-4 w-4"/></Button>
                    <Button variant="ghost" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[#0a0a0c] border-[#00f0ff] border-t-4">
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>UPLOAD_ARTIFACT</CardTitle>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required className="bg-black text-white" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                    <SelectTrigger className="bg-black text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-black text-white">
                      <SelectItem value="apparel">Apparel (T-Shirts)</SelectItem>
                      <SelectItem value="figures">Figures</SelectItem>
                      <SelectItem value="art">Art & Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Label>Description</Label>
              <Textarea required className="bg-black" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              <div className="grid grid-cols-3 gap-4">
                <Input type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                <Input type="number" placeholder="Stock" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                <Input type="number" placeholder="Discount" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
              </div>
              <Input placeholder="Image URL" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
              <Input placeholder="Tags (comma separated)" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} />
              <Button type="submit" disabled={loading} className="w-full bg-[#00f0ff] text-black">
                {loading ? "PROCESSING..." : "UPLINK TO MATRIX"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;