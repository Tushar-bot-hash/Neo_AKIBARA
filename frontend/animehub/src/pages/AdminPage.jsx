import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, RefreshCw, Shield, X, Check, Box 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    category: '', // Default to your requested item
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
        tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(t => t !== "") : []
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
      toast({ title: "Transmission Failed", description: err.response?.data?.message || "Verify data format.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'anime-t-shirts', image_url: '', stock: '', featured: false, discount: 0, tags: '' });
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
              <TableHead>PRODUCT</TableHead><TableHead>SUB-CATEGORY</TableHead><TableHead>STOCK</TableHead><TableHead className="text-right">PRICE</TableHead><TableHead className="text-right">ACTION</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id} className="border-gray-800">
                  <TableCell className="flex items-center gap-4">
                    <img src={p.image_url} className="w-10 h-10 rounded border border-gray-700 object-cover" />
                    <span className="font-bold">{p.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 uppercase">{p.category.replace(/-/g, ' ')}</TableCell>
                  <TableCell className="text-[#00f0ff]">{p.stock}</TableCell>
                  <TableCell className="text-right font-bold text-[#00f0ff]">${p.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => { setEditingId(p._id); setProductForm({...p, tags: p.tags.join(', ')}); setShowModal(true); }}><Edit className="h-4 w-4" /></Button>
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
              <CardTitle className="text-white uppercase italic">{editingId ? 'Modify_Artifact' : 'Register_Artifact'}</CardTitle>
              <X className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => setShowModal(false)} />
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-xs">PRODUCT NAME</Label>
                  <Input required className="bg-black border-gray-800" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-xs">TARGET FREQUENCY (CATEGORY)</Label>
                  <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                    <SelectTrigger className="bg-black border-gray-800 text-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent className="bg-[#0a0a0c] border-gray-800 text-white">
                      <SelectGroup>
                        <SelectLabel className="text-[#00f0ff]">FIGURES & COLLECTIBLES</SelectLabel>
                        <SelectItem value="evangelion-series">Evangelion Series</SelectItem>
                        <SelectItem value="gundam-models">Gundam Models</SelectItem>
                        <SelectItem value="nendoroids">Nendoroids</SelectItem>
                        <SelectItem value="scale-figures">Scale Figures</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-[#ff0055]">APPAREL</SelectLabel>
                        <SelectItem value="cyber-goth-hoodies">Cyber-Goth Hoodies</SelectItem>
                        <SelectItem value="anime-t-shirts">Anime T-Shirts</SelectItem>
                        <SelectItem value="jackets-outerwear">Jackets & Outerwear</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-[#00f0ff]">ART & MEDIA</SelectLabel>
                        <SelectItem value="posters-prints">Posters & Prints</SelectItem>
                        <SelectItem value="art-books">Art Books</SelectItem>
                        <SelectItem value="blu-ray-collections">Blu-ray Collections</SelectItem>
                        <SelectItem value="soundtracks">Soundtracks</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Rest of the form inputs... (Description, Price, Stock, Image URL) */}
              <div className="space-y-2">
                <Label className="text-white text-xs">DESCRIPTION</Label>
                <Textarea required className="bg-black border-gray-800" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input type="number" placeholder="Price" className="bg-black border-gray-800" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                <Input type="number" placeholder="Stock" className="bg-black border-gray-800" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                <Input type="number" placeholder="Discount" className="bg-black border-gray-800" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
              </div>
              <Input placeholder="Image URL" className="bg-black border-gray-800" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
              <Input placeholder="Tags (comma separated)" className="bg-black border-gray-800" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} />

              <Button type="submit" disabled={loading} className="w-full bg-[#00f0ff] text-black font-bold">
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