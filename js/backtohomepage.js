(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        #dejede-back-home {
            position: fixed;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 99999;
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #4A7C59 0%, #355842 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 10px 14px 10px 12px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(53, 88, 66, 0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 600;
            backdrop-filter: blur(5px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 200px; /* Diubah agar langsung melebar menampilkan teks */
            overflow: hidden;
            white-space: nowrap;
        }

        #dejede-back-home:hover {
            background: linear-gradient(135deg, #589169 0%, #4A7C59 100%);
            box-shadow: 0 6px 20px rgba(53, 88, 66, 0.4);
            padding-right: 18px;
        }

        #dejede-back-home .dejede-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
            height: 20px;
        }

        #dejede-back-home .dejede-icon svg {
            width: 20px;
            height: 20px;
            fill: #ffffff;
            transition: transform 0.3s ease;
        }

        #dejede-back-home:hover .dejede-icon svg {
            transform: translateX(-3px);
        }

        #dejede-back-home .dejede-text {
            opacity: 1; /* Diubah agar teks selalu terlihat */
            margin-left: 10px;
            letter-spacing: 0.3px;
        }

        /* Penyesuaian ukuran untuk HP agar tidak terlalu besar */
        @media (max-width: 768px) {
            #dejede-back-home {
                left: 10px;
                padding: 8px 12px 8px 10px;
                font-size: 13px;
            }
            #dejede-back-home .dejede-icon svg {
                width: 18px;
                height: 18px;
            }
        }
    `;
    document.head.appendChild(style);

    const button = document.createElement('a');
    button.id = 'dejede-back-home';
    button.href = 'index.html';
    button.setAttribute('title', 'Kembali ke Beranda');
    
    button.innerHTML = `
        <div class="dejede-icon">
            <svg viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
        </div>
        <span class="dejede-text">Beranda</span>
    `;

    document.body.appendChild(button);
})();