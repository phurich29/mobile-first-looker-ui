
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message || "กรุณาตรวจสอบอีเมลและรหัสผ่าน",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ใส่อีเมลและรหัสผ่านเพื่อลงทะเบียน",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (signUpError) {
        console.error("SignUp error:", signUpError);
        throw signUpError;
      }
      
      // Check if user already exists
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        toast({
          title: "อีเมลนี้มีผู้ใช้งานแล้ว",
          description: "กรุณาลงชื่อเข้าใช้หรือใช้อีเมลอื่น",
          variant: "destructive",
        });
        setActiveTab("login");
        return;
      }
      
      // Sign in automatically after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Auto login error:", signInError);
        throw signInError;
      }
      
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "คุณถูกเพิ่มในรายชื่อรอการอนุมัติแล้ว กรุณารอการตรวจสอบ",
      });
      
      // Navigate to waiting page - the ProtectedRoute component will handle the redirection
      navigate("/waiting");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "ลงทะเบียนไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to initialize a user role if none exists
  const checkAndInitializeUserRole = async (userId: string) => {
    try {
      // Check if the user has any roles
      const { data: roles, error: rolesError } = await supabase.rpc('get_user_roles', {
        user_id: userId
      });
      
      console.log("Checked roles for user:", userId, roles);
      
      // If no roles or error, try to add a default 'waiting_list' role
      if (rolesError || !roles || roles.length === 0) {
        console.log("No roles found, adding waiting_list role");
        const { error } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: 'waiting_list'
        });
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error("Error adding waiting_list role:", error);
        } else {
          console.log("Added waiting_list role successfully");
        }
      }
    } catch (error) {
      console.error("Error in checkAndInitializeUserRole:", error);
    }
  };
  
  // If user just logged in, check and initialize role if needed
  useEffect(() => {
    if (user && !isLoading) {
      checkAndInitializeUserRole(user.id);
    }
  }, [user, isLoading]);
  
  // If already logged in, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }
  
  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ระบบจัดการข้าว</CardTitle>
          <CardDescription className="text-center">เข้าสู่ระบบหรือลงทะเบียนเพื่อใช้งาน</CardDescription>
        </CardHeader>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4 mx-4">
            <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="register">ลงทะเบียน</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">อีเมล</Label>
                  <Input 
                    id="login-email"
                    type="email"
                    placeholder="อีเมลของคุณ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">รหัสผ่าน</Label>
                  <Input 
                    id="login-password"
                    type="password"
                    placeholder="รหัสผ่านของคุณ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </CardFooter>
            </form>
            
            <div className="px-6 pb-4 text-center">
              <p className="text-sm text-muted-foreground mt-2">
                <span className="block text-xs text-gray-500 mt-4">
                  สำหรับการทดสอบ: ลงทะเบียนด้วย <br />
                  user@example.com, admin@example.com หรือ superadmin@example.com <br />
                  เพื่อทดสอบสิทธิ์แต่ละระดับ
                </span>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">อีเมล</Label>
                  <Input 
                    id="register-email"
                    type="email"
                    placeholder="อีเมลของคุณ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">รหัสผ่าน</Label>
                  <Input 
                    id="register-password"
                    type="password"
                    placeholder="รหัสผ่านของคุณ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    placeholder="ยืนยันรหัสผ่านของคุณ"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
