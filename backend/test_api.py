#!/usr/bin/env python3
"""Quick test script to verify FastAPI setup"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("Testing FastAPI endpoints...\n")
    
    # Test root endpoint
    print("1. Testing root endpoint:")
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    
    # Test environment endpoint
    print("2. Testing environment endpoint:")
    response = requests.get(f"{BASE_URL}/api/environment/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    
    # Test profiles endpoint
    print("3. Testing profiles endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/api/profiles/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Found {len(response.json())} profiles")
    except Exception as e:
        print(f"   Error: {e}\n")
    
    # Test users endpoint
    print("4. Testing users endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/api/users/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {data['total']} users")
    except Exception as e:
        print(f"   Error: {e}\n")

if __name__ == "__main__":
    test_endpoints()