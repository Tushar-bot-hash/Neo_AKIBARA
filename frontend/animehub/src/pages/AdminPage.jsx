import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Shield, X, Check, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    category: 'clothing', 
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
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0,
        discount: parseInt(productForm.discount) || 0,
        tags: typeof productForm.tags === 'string' 
          ? productForm.tags.split(',').map(t => t.trim()).filter(t => t !== "")
          : productForm.tags
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast({ title: "ARTIFACT_MODIFIED" });
      } else {
        await api.post('/products', payload);
        toast({ title: "ARTIFACT_REGISTERED" });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast({ 
        title: "TRANSMISSION_FAILED", 
        description: err.response?.data?.message || "Verify data format.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ARE YOU SURE? This action will purge the artifact from the database.")) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast({ title: "ARTIFACT_PURGED", description: "Entry removed from sprawl." });
      fetchData();
    } catch (err) {
      toast({ title: "PURGE_FAILED", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'clothing', image_url: '', stock: '', featured: false, discount: 0, tags: '' });
    setEditingId(null);
  };

  if (user?.role !== 'admin') return <div className="min-h-screen flex items-center justify-center bg-black"><Shield className="h-20 w-20 text-[#ff0055] animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-bold tracking-tighter text-[#ff0055]">ADMIN_TERMINAL</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#00f0ff] text-black font-bold">
            <Plus className="mr-2 h-4 w-4" /> NEW_ENTRY
          </Button>
        </div>

        <Card className="bg-[#0a0a0c] border-gray-800">
          <Table>
            <TableHeader><TableRow className="border-gray-800 hover:bg-transparent bg-white/5">
              <TableHead>PRODUCT</TableHead><TableHead>CATEGORY</TableHead><TableHead>STOCK</TableHead><TableHead className="text-right">PRICE</TableHead><TableHead className="text-right">ACTION</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id} className="border-gray-800">
                  <TableCell className="flex items-center gap-4">
                    <img src={p.image_url} className="w-10 h-10 rounded border border-gray-700 object-cover" />
                    <span className="font-bold">{p.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 uppercase">{p.category}</TableCell>
                  <TableCell className="text-[#00f0ff]">{p.stock}</TableCell>
                  <TableCell className="text-right font-bold text-[#00f0ff]">${p.price}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { 
                        setEditingId(p._id); 
                        setProductForm({...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags}); 
                        setShowModal(true); 
                    }} className="hover:text-[#00f0ff]"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)} className="hover:text-[#ff0055]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[#0a0a0c] border-[#00f0ff] border-t-4 my-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-white uppercase italic tracking-widest">{editingId ? 'Modify_Artifact' : 'Register_Artifact'}</CardTitle>
              <X className="h-6 w-6 text-gray-500 cursor-pointer hover:text-white" onClick={() => setShowModal(false)} />
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-xs">PRODUCT NAME</Label>
                  <Input required className="bg-black border-gray-800 text-white" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-xs">TARGET SECTOR (CATEGORY)</Label>
                  <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                    <SelectTrigger className="bg-black border-gray-800 text-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent className="bg-[#0a0a0c] border-gray-800 text-white">
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="manga">Manga & Books</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="posters">Posters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white text-xs">DESCRIPTION</Label>
                <Textarea required className="bg-black border-gray-800 text-white" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label className="text-white text-[10px]">PRICE</Label>
                    <Input type="number" step="0.01" className="bg-black border-gray-800 text-white" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-white text-[10px]">STOCK</Label>
                    <Input type="number" className="bg-black border-gray-800 text-white" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <Label className="text-white text-[10px]">DISCOUNT %</Label>
                    <Input type="number" className="bg-black border-gray-800 text-white" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white text-xs">IMAGE URL</Label>
                <Input placeholder="https://..." className="bg-black border-gray-800 text-white" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-white text-xs">TAGS (COMMA SEPARATED)</Label>
                <Input placeholder="neon, oversized, limited" className="bg-black border-gray-800 text-white" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#00f0ff] text-black font-bold hover:bg-[#ff0055] hover:text-white transition-all">
                {loading ? <RefreshCw className="animate-spin" /> : 'EXECUTE UPLINK'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;