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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:5000/api';

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
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      toast({ title: "Sync Error", description: "Failed to connect to the Matrix.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          discount: parseInt(productForm.discount),
          tags: productForm.tags.split(',').map(t => t.trim())
        })
      });

      if (res.ok) {
        toast({ title: editingId ? "Artifact Updated" : "Artifact Uploaded" });
        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchData();
      }
    } catch (err) {
      toast({ title: "Transmission Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'figures', image_url: '', stock: '', featured: false, discount: 0, tags: '' });
    setEditingId(null);
  };

  if (user?.role !== 'admin') return <div className="p-20 text-center font-mono">ACCESS DENIED: ADMIN PRIVILEGES REQUIRED</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-[#ff0055]">DASHBOARD</h1>
            <p className="text-gray-400 font-mono text-sm">Welcome back, Root User.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#00f0ff] text-black font-bold hover:bg-[#00f0ff]/80">
            <Plus className="mr-2 h-4 w-4" /> ADD PRODUCT
          </Button>
        </div>

        <Card className="bg-[#0a0a0c] border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
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
                    <img src={p.image_url} className="w-12 h-12 rounded border border-gray-700 object-cover" />
                    <div>
                      <div className="text-white">{p.name}</div>
                      {p.featured && <Badge className="bg-[#ff0055] text-[10px] h-4">FEATURED</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-gray-400 font-mono">{p.category}</TableCell>
                  <TableCell>
                    <span className={p.stock < 10 ? "text-red-500" : "text-[#00f0ff]"}>{p.stock}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold">${p.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingId(p._id); setProductForm({...p, tags: p.tags.join(', ')}); setShowModal(true); }} className="hover:text-[#00f0ff]">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* NEO-AKIHABARA STYLED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-[#0a0a0c] border-[#00f0ff] border-t-4">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription className="text-gray-400 font-mono">Fill in the details for your cyber merchandise</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Product Name</Label>
                  <Input placeholder="e.g., Cyber-Goth Hoodie" className="bg-black border-gray-800 text-white" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold">Category</Label>
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
                <Label className="text-white font-bold">Description</Label>
                <Textarea placeholder="Describe your product..." className="bg-black border-gray-800 min-h-[100px]" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Price ($)</Label>
                  <Input type="number" className="bg-black border-gray-800" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold">Stock Quantity</Label>
                  <Input type="number" className="bg-black border-gray-800" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold">Discount (%)</Label>
                  <Input type="number" className="bg-black border-gray-800" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">Image URL</Label>
                  <Input placeholder="https://..." className="bg-black border-gray-800" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-bold">Tags (comma separated)</Label>
                  <Input placeholder="cyberpunk, hoodie, limited" className="bg-black border-gray-800" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="featured" checked={productForm.featured} onCheckedChange={(checked) => setProductForm({...productForm, featured: checked})} className="border-[#00f0ff] data-[state=checked]:bg-[#00f0ff]" />
                <Label htmlFor="featured" className="text-white cursor-pointer font-bold">Featured Product</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 border-gray-700 hover:bg-gray-900 text-white">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#00f0ff] text-black font-bold hover:bg-[#00f0ff]/80">
                  {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : editingId ? 'Update Product' : '+ Add Product'}
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