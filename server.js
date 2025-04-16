//app.post('/api/paiement-mobilemoney', async (req, res) => {
  const { nom, telephone, operateur } = req.body;

  const payload = {
    account_alias: telephone,
    //amount: MONTANT_MENSUEL,
    mobile_money_operator: operateur, // 'mtn', 'moov', 'orange', etc.
    invoice_data: {
      description: `Abonnement mensuel pour ${nom}`
    }
  };

  try {
    const response = await axios.post(
      'https://app.paydunya.com/api/v1/direct-pay/submit',
      payload,
      {
        headers: {
          //'Content-Type': 'application/json',
          //'PAYDUNYA-MASTER-KEY': masterKey,
          //'PAYDUNYA-PRIVATE-KEY': privateKey,
          //'PAYDUNYA-TOKEN': token,
          //'PAYDUNYA-MODE': mode
        }
      }
    );

    const data = response.data;

    if (data.response_code === '00') {
      // Paiement en attente de confirmation par le client sur son téléphone
      res.json({
        message: 'Paiement en attente de confirmation sur le téléphone',
        status: data.response_text,
        transaction_id: data.response_transaction_id
      });

      // Enregistrement du paiement dans la BDD
      const datePaiement = new Date().toISOString();
      db.run(
        `INSERT INTO paiements (telephone, date_paiement) VALUES (?, ?)`,
        [telephone, datePaiement],
        (err) => {
          if (err) console.error('Erreur enregistrement paiement :', err.message);
          else console.log(`Paiement enregistré pour ${telephone} le ${datePaiement}`);
        }
      );

    } else {
      res.status(400).json({ error: 'Paiement refusé', details: data });
    }
  } catch (error) {
    console.error('Erreur avec PayDunya Direct Pay:', error.message);
    res.status(500).json({ error: 'Erreur serveur PayDunya' });
  }
});
