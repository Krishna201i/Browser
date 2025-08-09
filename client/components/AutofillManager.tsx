import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Plus, Edit, Trash2, Lock, User, CreditCard, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SavedCredential {
  id: string;
  url: string;
  username: string;
  password: string;
  title: string;
  lastUsed: Date;
  strength: "weak" | "medium" | "strong";
}

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface SavedPayment {
  id: string;
  label: string;
  cardType: string;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv?: string;
  billingAddress?: string;
}

interface AutofillData {
  credentials: SavedCredential[];
  addresses: SavedAddress[];
  payments: SavedPayment[];
}

export default function AutofillManager() {
  const { toast } = useToast();
  const [autofillData, setAutofillData] = useState<AutofillData>({
    credentials: [],
    addresses: [],
    payments: [],
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kruger-autofill");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAutofillData(parsed);
      } catch (error) {
        console.error("Error loading autofill data:", error);
      }
    }
  }, []);

  // Save data to localStorage
  const saveData = (data: AutofillData) => {
    localStorage.setItem("kruger-autofill", JSON.stringify(data));
    setAutofillData(data);
  };

  // Password strength checker
  const checkPasswordStrength = (password: string): "weak" | "medium" | "strong" => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const score = [hasLower, hasUpper, hasNumber, hasSpecial, length >= 8].filter(Boolean).length;
    
    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
  };

  // Generate secure password
  const generatePassword = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Add new credential
  const addCredential = (credential: Omit<SavedCredential, "id" | "lastUsed" | "strength">) => {
    const newCredential: SavedCredential = {
      ...credential,
      id: Date.now().toString(),
      lastUsed: new Date(),
      strength: checkPasswordStrength(credential.password),
    };

    const updatedData = {
      ...autofillData,
      credentials: [...autofillData.credentials, newCredential],
    };
    saveData(updatedData);
    toast({
      title: "Credential saved",
      description: `Password for ${credential.title} has been saved securely.`,
    });
  };

  // Add new address
  const addAddress = (address: Omit<SavedAddress, "id">) => {
    const newAddress: SavedAddress = {
      ...address,
      id: Date.now().toString(),
    };

    const updatedData = {
      ...autofillData,
      addresses: [...autofillData.addresses, newAddress],
    };
    saveData(updatedData);
    toast({
      title: "Address saved",
      description: `${address.label} address has been saved.`,
    });
  };

  // Add new payment
  const addPayment = (payment: Omit<SavedPayment, "id">) => {
    const newPayment: SavedPayment = {
      ...payment,
      id: Date.now().toString(),
    };

    const updatedData = {
      ...autofillData,
      payments: [...autofillData.payments, newPayment],
    };
    saveData(updatedData);
    toast({
      title: "Payment method saved",
      description: `${payment.label} has been saved securely.`,
    });
  };

  // Delete item
  const deleteItem = (type: keyof AutofillData, id: string) => {
    const updatedData = {
      ...autofillData,
      [type]: autofillData[type].filter((item: any) => item.id !== id),
    };
    saveData(updatedData);
    toast({
      title: "Item deleted",
      description: "The item has been removed from your saved data.",
    });
  };

  // Filter items based on search
  const filteredItems = () => {
    const items = autofillData[activeTab as keyof AutofillData] || [];
    if (!searchTerm) return items;
    
    return items.filter((item: any) => {
      const searchableText = Object.values(item).join(" ").toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "weak": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case "strong": return "🟢";
      case "medium": return "🟡";
      case "weak": return "🔴";
      default: return "⚪";
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border hover:bg-background/90 transition-all"
        title="Autofill Manager"
      >
        <Lock className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Autofill Manager
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Controls */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search saved data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New {activeTab.slice(0, -1)}</DialogTitle>
                </DialogHeader>
                <AddNewForm
                  type={activeTab}
                  onAdd={(data) => {
                    if (activeTab === "credentials") {
                      addCredential(data);
                    } else if (activeTab === "addresses") {
                      addAddress(data);
                    } else if (activeTab === "payments") {
                      addPayment(data);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Passwords
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Payments
              </TabsTrigger>
            </TabsList>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-2">
              {filteredItems().map((credential: SavedCredential) => (
                <Card key={credential.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{credential.title}</h4>
                        <Badge variant="outline" className={getStrengthColor(credential.strength)}>
                          {getStrengthIcon(credential.strength)} {credential.strength}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{credential.url}</p>
                      <p className="text-sm">Username: {credential.username}</p>
                      <p className="text-sm">
                        Password: {showPasswords ? credential.password : "••••••••"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(credential.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem("credentials", credential.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-2">
              {filteredItems().map((address: SavedAddress) => (
                <Card key={address.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{address.label}</h4>
                      <p className="text-sm">
                        {address.firstName} {address.lastName}
                        {address.company && `, ${address.company}`}
                      </p>
                      <p className="text-sm">{address.address1}</p>
                      {address.address2 && <p className="text-sm">{address.address2}</p>}
                      <p className="text-sm">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm">{address.country}</p>
                      {address.phone && <p className="text-sm">📞 {address.phone}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem("addresses", address.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-2">
              {filteredItems().map((payment: SavedPayment) => (
                <Card key={payment.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{payment.label}</h4>
                      <p className="text-sm">{payment.cardholderName}</p>
                      <p className="text-sm">
                        {payment.cardType} •••• •••• •••• {payment.cardNumber.slice(-4)}
                      </p>
                      <p className="text-sm">Expires: {payment.expiryMonth}/{payment.expiryYear}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem("payments", payment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Add New Form Component
function AddNewForm({ type, onAdd }: { type: string; onAdd: (data: any) => void }) {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  if (type === "credentials") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Website URL"
          value={formData.url || ""}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />
        <Input
          placeholder="Title/Description"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          placeholder="Username"
          value={formData.username || ""}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password || ""}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <Button type="submit">Save Credential</Button>
      </form>
    );
  }

  if (type === "addresses") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Label (e.g., Home, Work)"
          value={formData.label || ""}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="First Name"
            value={formData.firstName || ""}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={formData.lastName || ""}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <Input
          placeholder="Company (optional)"
          value={formData.company || ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        <Input
          placeholder="Address Line 1"
          value={formData.address1 || ""}
          onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
        />
        <Input
          placeholder="Address Line 2 (optional)"
          value={formData.address2 || ""}
          onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="City"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <Input
            placeholder="State"
            value={formData.state || ""}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
          <Input
            placeholder="ZIP Code"
            value={formData.zipCode || ""}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
        </div>
        <Input
          placeholder="Country"
          value={formData.country || ""}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        />
        <Input
          placeholder="Phone (optional)"
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Button type="submit">Save Address</Button>
      </form>
    );
  }

  if (type === "payments") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Label (e.g., Personal Card, Work Card)"
          value={formData.label || ""}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
        <Input
          placeholder="Cardholder Name"
          value={formData.cardholderName || ""}
          onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
        />
        <Input
          placeholder="Card Number"
          value={formData.cardNumber || ""}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="MM"
            value={formData.expiryMonth || ""}
            onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
          />
          <Input
            placeholder="YYYY"
            value={formData.expiryYear || ""}
            onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
          />
          <Input
            placeholder="CVV"
            value={formData.cvv || ""}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
          />
        </div>
        <Button type="submit">Save Payment Method</Button>
      </form>
    );
  }

  return null;
}
