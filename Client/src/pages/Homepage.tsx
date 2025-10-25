import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, Shield, ArrowRight, BarChart3, Cloud, Brain, UserCheck, BookOpen, MessageSquare, Calendar, DollarSign, Smartphone, Lock } from "lucide-react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Homepage = () => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating geometric shapes
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.ConeGeometry(0.7, 1.5, 8),
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9)
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 })
    ];

    const meshes: THREE.Mesh[] = [];

    // Create multiple floating objects
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = (Math.random() - 0.5) * 10;
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1, 100);
    pointLight.position.set(-10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 15;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.005 + index * 0.001;
        mesh.rotation.y += 0.005 + index * 0.001;
        mesh.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        mesh.position.x += Math.cos(Date.now() * 0.0008 + index) * 0.001;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const roles = [
    {
      title: "Student",
      description: "Access your courses and track progress",
      icon: GraduationCap,
      path: "/login/student",
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/25"
    },
    {
      title: "Teacher", 
      description: "Manage classes and student performance",
      icon: Users,
      path: "/login/teacher",
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/25"
    },
    {
      title: "Admin",
      description: "Complete system administration",
      icon: Shield,
      path: "/login/admin",
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/25"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/40 z-10" />
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Acadion</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Acadion
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-light text-white/90 mb-6">
            Next-Generation School Management
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Transform your educational institution with cutting-edge technology. 
            Seamlessly connect students, teachers, and administrators in one powerful platform.
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className={`group relative transform transition-all duration-700 hover:scale-105 hover:-translate-y-2`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${role.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30 ${role.shadow} group-hover:shadow-2xl`}>
                  
                  {/* Floating icon */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${role.gradient} flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors duration-300">
                    {role.title}
                  </h3>
                  
                  <p className="text-white/70 mb-8 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {role.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => navigate(role.path)}
                    className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${role.gradient} text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group-hover:shadow-${role.shadow}`}
                  >
                    <span className="flex items-center justify-center gap-3">
                      Enter as {role.title}
                      <ArrowRight className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* About Section */}
        <section id="about" className="mt-32 max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Acadion</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built for the future of education with cutting-edge technology and intuitive design
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "Real-time Analytics",
                description: "Monitor student progress and institutional performance with live data visualization",
                icon: BarChart3,
                color: "text-blue-400"
              },
              {
                title: "Cloud-First Architecture",
                description: "Secure, scalable, and accessible from anywhere with enterprise-grade infrastructure",
                icon: Cloud,
                color: "text-cyan-400"
              },
              {
                title: "AI-Powered Insights",
                description: "Smart recommendations and predictive analytics to enhance educational outcomes",
                icon: Brain,
                color: "text-purple-400"
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group relative h-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 h-full flex flex-col">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                      <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed flex-1">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl w-full mb-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need in One Platform
              </h2>
              <p className="text-lg text-white/70">
                Comprehensive tools designed for modern educational institutions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: UserCheck, title: "Student Management", desc: "Complete student lifecycle management", color: "text-blue-400" },
                { icon: BookOpen, title: "Academic Planning", desc: "Curriculum and course management", color: "text-green-400" },
                { icon: BarChart3, title: "Performance Tracking", desc: "Real-time progress monitoring", color: "text-purple-400" },
                { icon: MessageSquare, title: "Communication Hub", desc: "Seamless parent-teacher interaction", color: "text-pink-400" },
                { icon: Calendar, title: "Smart Scheduling", desc: "Automated timetable generation", color: "text-orange-400" },
                { icon: DollarSign, title: "Financial Management", desc: "Fee collection and accounting", color: "text-emerald-400" },
                { icon: Smartphone, title: "Mobile Access", desc: "Native iOS and Android apps", color: "text-cyan-400" },
                { icon: Lock, title: "Enterprise Security", desc: "Bank-level data protection", color: "text-red-400" }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                      <IconComponent className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30"></div>
          </div>
          <p className="text-white/50 text-sm">
            © 2024 Acadion. Revolutionizing Education Through Innovation.
          </p>
        </footer>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;