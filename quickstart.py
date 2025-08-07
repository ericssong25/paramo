#!/usr/bin/env python3
"""
Quickstart script for Paramo - Project Management Platform
This script sets up the development environment and inserts sample data into Supabase.
"""

import os
import subprocess
import sys
import json
import requests
from datetime import datetime, timedelta
import random

# Supabase configuration
SUPABASE_URL = "https://hznvcktueznfvpulkmby.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bnZja3R1ZXpuZnZwdWxrbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI5NzQsImV4cCI6MjA3MDE0ODk3NH0.XcbkBFtBTRanC-CoYsFhtSJeZMKmx9-fwVm9rQW7m7w"

def check_node_installed():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def check_npm_installed():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ npm not found")
            return False
    except FileNotFoundError:
        print("❌ npm not found")
        return False

def install_dependencies():
    """Install npm dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.run(['npm', 'install'], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def insert_sample_data():
    """Insert sample data into Supabase"""
    print("\n🗄️ Inserting sample data into Supabase...")
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }

    # Sample profiles
    profiles = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "user_id": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Ana García",
            "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            "role": "admin"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "user_id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "Carlos Rodríguez",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "role": "member"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440003",
            "user_id": "550e8400-e29b-41d4-a716-446655440003",
            "name": "María López",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "role": "member"
        }
    ]

    # Sample projects
    projects = [
        {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Rediseño Web E-commerce",
            "description": "Rediseño completo del sitio web de comercio electrónico para mejorar la experiencia del usuario y aumentar las conversiones",
            "color": "#3B82F6",
            "type": "finite",
            "status": "in-progress",
            "client": "TechStore",
            "project_lead_id": "550e8400-e29b-41d4-a716-446655440001",
            "objective": "Aumentar las conversiones en un 25% y mejorar la velocidad de carga",
            "scope": ["Diseño UI/UX", "Desarrollo Frontend", "Optimización SEO", "Testing"],
            "final_due_date": (datetime.now() + timedelta(days=45)).strftime('%Y-%m-%d'),
            "drive_link": "https://drive.google.com/drive/folders/1ABC123"
        },
        {
            "id": "660e8400-e29b-41d4-a716-446655440002",
            "name": "Gestión de Redes Sociales",
            "description": "Servicio mensual de gestión de redes sociales para mantener presencia activa y engagement",
            "color": "#10B981",
            "type": "recurring",
            "status": "recurring-active",
            "client": "Café Central",
            "project_lead_id": "550e8400-e29b-41d4-a716-446655440002",
            "objective": "Mantener engagement constante y aumentar seguidores",
            "scope": ["Contenido diario", "Community management", "Análisis de métricas"],
            "service_cycle": "monthly",
            "reporting_day": 15,
            "monthly_deliverables": ["Reporte mensual", "Calendario de contenido", "Análisis de competencia"]
        },
        {
            "id": "660e8400-e29b-41d4-a716-446655440003",
            "name": "Campaña de Lanzamiento",
            "description": "Campaña integral de lanzamiento para nuevo producto en el mercado",
            "color": "#F59E0B",
            "type": "finite",
            "status": "planning",
            "client": "InnovateLab",
            "project_lead_id": "550e8400-e29b-41d4-a716-446655440001",
            "objective": "Generar 1000 leads cualificados en 30 días",
            "scope": ["Estrategia de marketing", "Contenido creativo", "Publicidad digital", "Eventos"],
            "final_due_date": (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d')
        }
    ]

    # Sample tasks
    tasks = [
        {
            "id": "770e8400-e29b-41d4-a716-446655440001",
            "title": "Diseñar wireframes de la página principal",
            "description": "Crear wireframes detallados para la página principal del e-commerce",
            "status": "in-progress",
            "priority": "high",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440001",
            "due_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "project_id": "660e8400-e29b-41d4-a716-446655440001",
            "tags": ["diseño", "ui/ux", "wireframes"]
        },
        {
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "title": "Crear contenido para Instagram",
            "description": "Desarrollar 30 posts para Instagram del mes de diciembre",
            "status": "todo",
            "priority": "normal",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440002",
            "due_date": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
            "project_id": "660e8400-e29b-41d4-a716-446655440002",
            "tags": ["contenido", "instagram", "redes sociales"]
        },
        {
            "id": "770e8400-e29b-41d4-a716-446655440003",
            "title": "Investigación de competencia",
            "description": "Analizar 10 competidores principales y sus estrategias de marketing",
            "status": "done",
            "priority": "high",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440003",
            "due_date": (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d'),
            "project_id": "660e8400-e29b-41d4-a716-446655440003",
            "tags": ["investigación", "competencia", "análisis"]
        },
        {
            "id": "770e8400-e29b-41d4-a716-446655440004",
            "title": "Optimizar velocidad de carga",
            "description": "Implementar optimizaciones para mejorar el tiempo de carga del sitio",
            "status": "review",
            "priority": "urgent",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440001",
            "due_date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
            "project_id": "660e8400-e29b-41d4-a716-446655440001",
            "tags": ["optimización", "performance", "técnico"]
        },
        {
            "id": "770e8400-e29b-41d4-a716-446655440005",
            "title": "Crear video promocional",
            "description": "Producir video de 60 segundos para promocionar el nuevo producto",
            "status": "todo",
            "priority": "high",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440002",
            "due_date": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
            "project_id": "660e8400-e29b-41d4-a716-446655440003",
            "tags": ["video", "producción", "marketing"]
        }
    ]

    # Sample content items
    content_items = [
        {
            "id": "880e8400-e29b-41d4-a716-446655440001",
            "title": "Post: Nuevos productos de temporada",
            "description": "Presentación de la nueva colección de productos de temporada",
            "type": "post",
            "platform": "instagram",
            "status": "scheduled",
            "scheduled_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "assignee_id": "550e8400-e29b-41d4-a716-446655440002",
            "project_id": "660e8400-e29b-41d4-a716-446655440002",
            "content": "¡Descubre nuestra nueva colección de temporada! 🌟 Productos únicos que transformarán tu día. #NuevaColección #Temporada",
            "hashtags": ["#NuevaColección", "#Temporada", "#Productos", "#Descubre"],
            "mentions": ["@cafecentral"]
        },
        {
            "id": "880e8400-e29b-41d4-a716-446655440002",
            "title": "Story: Behind the scenes",
            "description": "Story mostrando el proceso de creación de nuestros productos",
            "type": "story",
            "platform": "instagram",
            "status": "draft",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440002",
            "project_id": "660e8400-e29b-41d4-a716-446655440002",
            "content": "¿Quieres ver cómo se crean nuestros productos? Te llevamos detrás de cámaras 🎬",
            "hashtags": ["#BehindTheScenes", "#Proceso", "#Creación"]
        },
        {
            "id": "880e8400-e29b-41d4-a716-446655440003",
            "title": "Video: Tutorial de uso",
            "description": "Video tutorial explicando cómo usar el nuevo producto",
            "type": "video",
            "platform": "youtube",
            "status": "approved",
            "assignee_id": "550e8400-e29b-41d4-a716-446655440003",
            "project_id": "660e8400-e29b-41d4-a716-446655440003",
            "content": "Aprende a usar nuestro nuevo producto en solo 3 minutos. Tutorial completo paso a paso.",
            "hashtags": ["#Tutorial", "#CómoUsar", "#ProductoNuevo"]
        }
    ]

    # Insert data
    try:
        # Insert profiles
        for profile in profiles:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/profiles",
                headers=headers,
                json=profile
            )
            if response.status_code == 201:
                print(f"✅ Profile created: {profile['name']}")
            else:
                print(f"⚠️ Profile {profile['name']}: {response.status_code}")

        # Insert projects
        for project in projects:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/projects",
                headers=headers,
                json=project
            )
            if response.status_code == 201:
                print(f"✅ Project created: {project['name']}")
            else:
                print(f"⚠️ Project {project['name']}: {response.status_code}")

        # Insert tasks
        for task in tasks:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/tasks",
                headers=headers,
                json=task
            )
            if response.status_code == 201:
                print(f"✅ Task created: {task['title']}")
            else:
                print(f"⚠️ Task {task['title']}: {response.status_code}")

        # Insert content items
        for content in content_items:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/content_items",
                headers=headers,
                json=content
            )
            if response.status_code == 201:
                print(f"✅ Content created: {content['title']}")
            else:
                print(f"⚠️ Content {content['title']}: {response.status_code}")

        print("\n✅ Sample data inserted successfully!")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")

def main():
    """Main function to set up the development environment"""
    print("🚀 Paramo - Project Management Platform")
    print("=" * 50)
    
    # Check prerequisites
    if not check_node_installed():
        print("\n❌ Please install Node.js first: https://nodejs.org/")
        sys.exit(1)
    
    if not check_npm_installed():
        print("\n❌ Please install npm first")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Failed to install dependencies")
        sys.exit(1)
    
    # Insert sample data
    insert_sample_data()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the development server: npm run dev")
    print("2. Open your browser to: http://localhost:5173")
    print("3. Explore the application with real data from Supabase!")
    print("\n💡 Tip: The application is now connected to your Supabase database")
    print("   You can create, edit, and delete projects, tasks, and content items")

if __name__ == "__main__":
    main()
