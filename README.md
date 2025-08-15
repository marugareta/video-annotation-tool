# Video Annotation Tool

A web application for annotating video transitions with up/down labels. Built with Next.js, MongoDB, and NextAuth.js.

## Features

### For Users
- 🎥 View available videos
- ⏯️ Play videos with built-in controls
- 🏷️ Mark up/down transitions with simple buttons
- 📊 View all annotations in real-time
- 📥 Export annotations as CSV

### For Admins
- ⬆️ Upload new videos for annotation
- 👥 View all user annotations
- ✏️ Delete annotations
- 📈 Export consolidated CSV reports
- 🎛️ Full video management

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB Atlas
- **File Upload**: Built-in Next.js API
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd anotation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # Database - Get from MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/video-annotation?retryWrites=true&w=majority
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # JWT Secret
   JWT_SECRET=another-secret-key-here
   ```

4. **Create uploads directory**
   ```bash
   mkdir public/uploads
   ```

5. **Create an admin user** (optional)
   ```bash
   node scripts/create-admin.js
   ```
   This creates an admin user with:
   - Email: `admin@example.com`
   - Password: `admin123`

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Register a new account** or use the default admin credentials
2. **Admin users** can upload videos in the Admin Dashboard
3. **Regular users** can select videos and start annotating
4. **Annotations** are created by clicking "Mark UP" or "Mark DOWN" while watching videos
5. **Export** your annotations as CSV files

### User Roles

- **Admin**: Can upload videos, view all annotations, delete annotations
- **User**: Can view videos and create their own annotations

### Video Formats

Supported video formats:
- MP4
- WebM
- Ogg
- Any format supported by HTML5 video element

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Videos
- `GET /api/videos` - List all videos
- `POST /api/videos` - Upload new video (admin only)

### Annotations
- `GET /api/annotations?videoId={id}` - Get annotations for a video
- `POST /api/annotations` - Create new annotation
- `DELETE /api/annotations/[id]` - Delete annotation (admin only)

### Export
- `GET /api/export?videoId={id}` - Export annotations as CSV

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables for Production**
   ```env
   MONGODB_URI=your-production-mongodb-uri
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   JWT_SECRET=your-production-jwt-secret
   ```

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string and add it to your environment variables

## File Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── annotate/[id]/      # Video annotation page
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── videos/         # Video management
│   │   ├── annotations/    # Annotation CRUD
│   │   ├── register/       # User registration
│   │   └── export/         # CSV export
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── videos/             # Video listing
├── components/             # Reusable components
├── lib/                    # Utilities and configuration
├── types/                  # TypeScript type definitions
└── middleware.ts           # Route protection
```

## CSV Output Format

The exported CSV contains the following columns:
- **ID**: Annotation ID
- **User ID**: ID of the user who made the annotation
- **Username**: Username of the annotator
- **Email**: Email of the annotator
- **Timestamp (seconds)**: Time in the video when annotation was made
- **Label**: UP or DOWN
- **Created At**: ISO timestamp when annotation was created

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Check your connection string
   - Ensure your IP is whitelisted
   - Verify database user credentials

2. **Video Upload Issues**
   - Ensure `public/uploads` directory exists
   - Check file size limits
   - Verify video format support

3. **Authentication Issues**
   - Check NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your domain
   - Clear browser cookies and try again

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check file permissions for uploads directory

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the development team.
